import CoreLocation
import Network
import PhotosUI
import UIKit
import UniformTypeIdentifiers
import WebKit

final class WebViewController: UIViewController {
    private static let geolocationHandlerName = "utsavasGeolocation"
    private static let geolocationBridgeScript = """
    (() => {
      if (window.__utsavasNativeGeoInstalled) {
        return;
      }
      window.__utsavasNativeGeoInstalled = true;

      const callbacks = new Map();
      let nextId = 1;
      const existingGeolocation = navigator.geolocation || {};

      function rememberCallbacks(success, error, oneShot) {
        const callbackId = nextId++;
        callbacks.set(callbackId, { success, error, oneShot });
        return callbackId;
      }

      function postMessage(type, callbackId, options) {
        try {
          window.webkit.messageHandlers.utsavasGeolocation.postMessage({
            type,
            callbackId,
            options: options || {}
          });
        } catch (error) {
          const callbackEntry = callbacks.get(callbackId);
          if (callbackEntry && typeof callbackEntry.error === "function") {
            callbackEntry.error({
              code: 2,
              message: "Location is not available in this app session.",
              PERMISSION_DENIED: 1,
              POSITION_UNAVAILABLE: 2,
              TIMEOUT: 3
            });
          }
          if (callbackEntry?.oneShot) {
            callbacks.delete(callbackId);
          }
        }
      }

      window.__utsavasNativeGeoSuccess = (callbackId, position) => {
        const callbackEntry = callbacks.get(callbackId);
        if (!callbackEntry) {
          return;
        }
        if (typeof callbackEntry.success === "function") {
          callbackEntry.success(position);
        }
        if (callbackEntry.oneShot) {
          callbacks.delete(callbackId);
        }
      };

      window.__utsavasNativeGeoError = (callbackId, code, message) => {
        const callbackEntry = callbacks.get(callbackId);
        if (!callbackEntry) {
          return;
        }
        if (typeof callbackEntry.error === "function") {
          callbackEntry.error({
            code,
            message,
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3
          });
        }
        if (callbackEntry.oneShot) {
          callbacks.delete(callbackId);
        }
      };

      existingGeolocation.getCurrentPosition = (success, error, options) => {
        const callbackId = rememberCallbacks(success, error, true);
        postMessage("getCurrentPosition", callbackId, options);
      };

      existingGeolocation.watchPosition = (success, error, options) => {
        const callbackId = rememberCallbacks(success, error, false);
        postMessage("watchPosition", callbackId, options);
        return callbackId;
      };

      existingGeolocation.clearWatch = (callbackId) => {
        callbacks.delete(callbackId);
        postMessage("clearWatch", callbackId, {});
      };

      try {
        navigator.geolocation = existingGeolocation;
      } catch (error) {
        Object.defineProperty(navigator, "geolocation", {
          configurable: true,
          value: existingGeolocation
        });
      }
    })();
    """

    private let refreshControl = UIRefreshControl()
    private let progressView = UIProgressView(progressViewStyle: .default)
    private let toolbar = UIToolbar()
    private let offlineCard = UIView()
    private let offlineTitleLabel = UILabel()
    private let offlineMessageLabel = UILabel()
    private let retryButton = UIButton(type: .system)
    private let networkMonitor = NWPathMonitor()
    private let locationManager = CLLocationManager()
    private let networkMonitorQueue = DispatchQueue(label: "com.talme.utsavas.ios.network")

    private var progressObservation: NSKeyValueObservation?
    private var pendingFileSelection: (([URL]?) -> Void)?
    private var hasActiveConnection = true
    private var pendingOneShotGeoCallbacks = Set<Int>()
    private var activeWatchGeoCallbacks = Set<Int>()
    private var temporaryUploadURLs = [URL]()

    private lazy var backButton = UIBarButtonItem(
        image: UIImage(systemName: "chevron.backward"),
        style: .plain,
        target: self,
        action: #selector(goBack)
    )

    private lazy var forwardButton = UIBarButtonItem(
        image: UIImage(systemName: "chevron.forward"),
        style: .plain,
        target: self,
        action: #selector(goForward)
    )

    private lazy var homeButton = UIBarButtonItem(
        image: UIImage(systemName: "house"),
        style: .plain,
        target: self,
        action: #selector(goHome)
    )

    private lazy var refreshButton = UIBarButtonItem(
        barButtonSystemItem: .refresh,
        target: self,
        action: #selector(refreshCurrentPage)
    )

    private lazy var shareButton = UIBarButtonItem(
        barButtonSystemItem: .action,
        target: self,
        action: #selector(shareCurrentPage)
    )

    private lazy var webView: WKWebView = {
        let userContentController = WKUserContentController()
        let bridgeScript = WKUserScript(
            source: Self.geolocationBridgeScript,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        userContentController.addUserScript(bridgeScript)
        userContentController.add(
            WeakScriptMessageHandler(delegate: self),
            name: Self.geolocationHandlerName
        )

        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.userContentController = userContentController
        configuration.applicationNameForUserAgent = "UTSAVAS-iOS"
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = true
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.defaultWebpagePreferences.preferredContentMode = .mobile

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.refreshControl = refreshControl
        webView.scrollView.keyboardDismissMode = .onDrag
        webView.backgroundColor = .utsavasBackground
        webView.isOpaque = false

        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }

        return webView
    }()

    deinit {
        progressObservation?.invalidate()
        networkMonitor.cancel()
        clearTemporaryUploadURLs()
        webView.configuration.userContentController.removeScriptMessageHandler(forName: Self.geolocationHandlerName)
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        configureViewHierarchy()
        configureWebView()
        configureLocationManager()
        startNetworkMonitoring()
        updateNavigationControls()
        loadHome()
    }

    private func configureViewHierarchy() {
        view.backgroundColor = .utsavasBackground

        progressView.translatesAutoresizingMaskIntoConstraints = false
        progressView.progressTintColor = .utsavasPrimary
        progressView.trackTintColor = UIColor.utsavasPrimary.withAlphaComponent(0.16)
        progressView.isHidden = true

        webView.translatesAutoresizingMaskIntoConstraints = false

        toolbar.translatesAutoresizingMaskIntoConstraints = false
        toolbar.tintColor = .utsavasPrimary
        toolbar.isTranslucent = true
        toolbar.setItems(
            [
                backButton,
                UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil),
                forwardButton,
                UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil),
                homeButton,
                UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil),
                refreshButton,
                UIBarButtonItem(barButtonSystemItem: .flexibleSpace, target: nil, action: nil),
                shareButton,
            ],
            animated: false
        )

        offlineCard.translatesAutoresizingMaskIntoConstraints = false
        offlineCard.backgroundColor = UIColor.white.withAlphaComponent(0.96)
        offlineCard.layer.cornerRadius = 24
        offlineCard.layer.cornerCurve = .continuous
        offlineCard.layer.shadowColor = UIColor.black.cgColor
        offlineCard.layer.shadowOpacity = 0.08
        offlineCard.layer.shadowRadius = 24
        offlineCard.layer.shadowOffset = CGSize(width: 0, height: 12)
        offlineCard.isHidden = true

        offlineTitleLabel.text = "You are offline"
        offlineTitleLabel.font = .systemFont(ofSize: 24, weight: .bold)
        offlineTitleLabel.textColor = .utsavasText
        offlineTitleLabel.textAlignment = .center
        offlineTitleLabel.numberOfLines = 0

        offlineMessageLabel.text =
            "UTSAVAS needs an internet connection to load the latest venue listings, bookings, and payments."
        offlineMessageLabel.font = .systemFont(ofSize: 16, weight: .regular)
        offlineMessageLabel.textColor = UIColor.utsavasText.withAlphaComponent(0.76)
        offlineMessageLabel.textAlignment = .center
        offlineMessageLabel.numberOfLines = 0

        var buttonConfiguration = UIButton.Configuration.filled()
        buttonConfiguration.baseBackgroundColor = .utsavasPrimary
        buttonConfiguration.baseForegroundColor = .white
        buttonConfiguration.cornerStyle = .large
        buttonConfiguration.title = "Try Again"
        buttonConfiguration.contentInsets = NSDirectionalEdgeInsets(top: 12, leading: 20, bottom: 12, trailing: 20)
        retryButton.configuration = buttonConfiguration
        retryButton.addAction(UIAction { [weak self] _ in
            self?.handleRetry()
        }, for: .touchUpInside)

        let stackView = UIStackView(arrangedSubviews: [offlineTitleLabel, offlineMessageLabel, retryButton])
        stackView.translatesAutoresizingMaskIntoConstraints = false
        stackView.axis = .vertical
        stackView.alignment = .fill
        stackView.spacing = 16

        offlineCard.addSubview(stackView)
        view.addSubview(webView)
        view.addSubview(progressView)
        view.addSubview(toolbar)
        view.addSubview(offlineCard)

        NSLayoutConstraint.activate([
            progressView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            progressView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            progressView.trailingAnchor.constraint(equalTo: view.trailingAnchor),

            webView.topAnchor.constraint(equalTo: progressView.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: toolbar.topAnchor),

            toolbar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            toolbar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            toolbar.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor),

            offlineCard.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            offlineCard.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            offlineCard.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 24),
            offlineCard.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -24),
            offlineCard.widthAnchor.constraint(lessThanOrEqualToConstant: 420),

            stackView.topAnchor.constraint(equalTo: offlineCard.topAnchor, constant: 24),
            stackView.leadingAnchor.constraint(equalTo: offlineCard.leadingAnchor, constant: 24),
            stackView.trailingAnchor.constraint(equalTo: offlineCard.trailingAnchor, constant: -24),
            stackView.bottomAnchor.constraint(equalTo: offlineCard.bottomAnchor, constant: -24),
        ])
    }

    private func configureWebView() {
        refreshControl.tintColor = .utsavasPrimary
        refreshControl.addTarget(self, action: #selector(handleRefresh), for: .valueChanged)

        progressObservation = webView.observe(\.estimatedProgress, options: [.new]) { [weak self] _, _ in
            self?.updateProgressView()
        }
    }

    private func configureLocationManager() {
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    }

    private func startNetworkMonitoring() {
        networkMonitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.hasActiveConnection = path.status == .satisfied
            }
        }

        networkMonitor.start(queue: networkMonitorQueue)
    }

    private func loadHome() {
        guard hasActiveConnection else {
            showOfflineState()
            return
        }

        let request = URLRequest(url: AppConfig.initialURL)
        webView.load(request)
    }

    @objc private func goBack() {
        guard webView.canGoBack else {
            return
        }

        webView.goBack()
    }

    @objc private func goForward() {
        guard webView.canGoForward else {
            return
        }

        webView.goForward()
    }

    @objc private func goHome() {
        loadHome()
    }

    @objc private func refreshCurrentPage() {
        handleRefresh()
    }

    @objc private func shareCurrentPage() {
        guard let url = webView.url else {
            return
        }

        let activityController = UIActivityViewController(activityItems: [url], applicationActivities: nil)

        if let popover = activityController.popoverPresentationController {
            popover.barButtonItem = shareButton
        }

        present(activityController, animated: true)
    }

    @objc private func handleRefresh() {
        guard hasActiveConnection else {
            refreshControl.endRefreshing()
            showOfflineState()
            return
        }

        if webView.url == nil {
            loadHome()
        } else {
            webView.reload()
        }
    }

    private func handleRetry() {
        if webView.url == nil {
            loadHome()
        } else if hasActiveConnection {
            hideOfflineState()
            webView.reload()
        } else {
            showOfflineState()
        }
    }

    private func updateProgressView() {
        let progress = Float(webView.estimatedProgress)
        progressView.progress = progress
        progressView.isHidden = progress <= 0.01 || progress >= 1.0

        if progress >= 1.0 {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
                self?.progressView.isHidden = true
                self?.progressView.progress = 0
            }
        }
    }

    private func updateNavigationControls() {
        backButton.isEnabled = webView.canGoBack
        forwardButton.isEnabled = webView.canGoForward
        shareButton.isEnabled = webView.url != nil
    }

    private func showOfflineState() {
        refreshControl.endRefreshing()
        progressView.isHidden = true
        offlineCard.isHidden = false
    }

    private func hideOfflineState() {
        offlineCard.isHidden = true
    }

    private func shouldOpenExternally(_ url: URL) -> Bool {
        guard let scheme = url.scheme?.lowercased() else {
            return false
        }

        switch scheme {
        case "http", "https":
            return !AppConfig.shouldOpenInApp(url)
        case "about", "javascript", "data":
            return false
        default:
            return true
        }
    }

    private func handlePopupNavigation(for url: URL) {
        if shouldOpenExternally(url) {
            openExternal(url)
            return
        }

        webView.load(URLRequest(url: url))
    }

    private func openExternal(_ url: URL) {
        UIApplication.shared.open(url, options: [:]) { [weak self] success in
            if !success {
                self?.presentExternalOpenError()
            }
        }
    }

    private func presentExternalOpenError() {
        let alert = UIAlertController(
            title: "Unable to Open Link",
            message: "This link could not be opened on this iPhone.",
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }

    private func beginFileSelection(
        parameters: WKOpenPanelParameters,
        completionHandler: @escaping ([URL]?) -> Void
    ) {
        clearTemporaryUploadURLs()
        pendingFileSelection?(nil)
        pendingFileSelection = completionHandler

        let contentTypes = parameters.allowedContentTypes.isEmpty ? [UTType.item] : parameters.allowedContentTypes
        let acceptsImages = contentTypes.contains(where: { $0.conforms(to: .image) || $0 == .image || $0 == .jpeg || $0 == .png })

        guard acceptsImages else {
            presentDocumentPicker(contentTypes: contentTypes, allowsMultipleSelection: parameters.allowsMultipleSelection)
            return
        }

        presentUploadSourceSheet(contentTypes: contentTypes, allowsMultipleSelection: parameters.allowsMultipleSelection)
    }

    private func finishFileSelection(with urls: [URL]?) {
        let completion = pendingFileSelection
        pendingFileSelection = nil
        completion?(urls)
    }

    private func presentDocumentPicker(contentTypes: [UTType], allowsMultipleSelection: Bool) {
        let picker = UIDocumentPickerViewController(forOpeningContentTypes: contentTypes, asCopy: true)
        picker.delegate = self
        picker.allowsMultipleSelection = allowsMultipleSelection
        present(picker, animated: true)
    }

    private func presentUploadSourceSheet(contentTypes: [UTType], allowsMultipleSelection: Bool) {
        let alert = UIAlertController(title: "Choose Upload Source", message: nil, preferredStyle: .actionSheet)

        alert.addAction(
            UIAlertAction(title: "Photos", style: .default) { [weak self] _ in
                self?.presentPhotoPicker(allowsMultipleSelection: allowsMultipleSelection)
            }
        )

        if !allowsMultipleSelection, UIImagePickerController.isSourceTypeAvailable(.camera) {
            alert.addAction(
                UIAlertAction(title: "Camera", style: .default) { [weak self] _ in
                    self?.presentCameraPicker()
                }
            )
        }

        alert.addAction(
            UIAlertAction(title: "Files", style: .default) { [weak self] _ in
                self?.presentDocumentPicker(contentTypes: contentTypes, allowsMultipleSelection: allowsMultipleSelection)
            }
        )

        alert.addAction(
            UIAlertAction(title: "Cancel", style: .cancel) { [weak self] _ in
                self?.finishFileSelection(with: nil)
            }
        )

        if let popover = alert.popoverPresentationController {
            popover.sourceView = view
            popover.sourceRect = toolbar.frame
        }

        present(alert, animated: true)
    }

    private func presentPhotoPicker(allowsMultipleSelection: Bool) {
        var configuration = PHPickerConfiguration(photoLibrary: .shared())
        configuration.filter = .images
        configuration.selectionLimit = allowsMultipleSelection ? 0 : 1

        let picker = PHPickerViewController(configuration: configuration)
        picker.delegate = self
        present(picker, animated: true)
    }

    private func presentCameraPicker() {
        let picker = UIImagePickerController()
        picker.delegate = self
        picker.sourceType = .camera
        picker.mediaTypes = ["public.image"]
        present(picker, animated: true)
    }

    private func replaceTemporaryUploadURLs(with urls: [URL]) {
        clearTemporaryUploadURLs()
        temporaryUploadURLs = urls
    }

    private func clearTemporaryUploadURLs() {
        temporaryUploadURLs.forEach { url in
            try? FileManager.default.removeItem(at: url)
        }
        temporaryUploadURLs.removeAll()
    }

    private func handleNavigationFailure(_ error: Error) {
        refreshControl.endRefreshing()

        let nsError = error as NSError
        if nsError.code == NSURLErrorCancelled {
            return
        }

        showOfflineState()
    }

    private func handleGeolocationRequest(callbackId: Int, isWatch: Bool) {
        let authorizationStatus = locationManager.authorizationStatus

        switch authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            if isWatch {
                let shouldStartUpdating = activeWatchGeoCallbacks.isEmpty
                activeWatchGeoCallbacks.insert(callbackId)
                if shouldStartUpdating {
                    locationManager.startUpdatingLocation()
                }
            } else {
                let shouldRequestLocation = pendingOneShotGeoCallbacks.isEmpty
                pendingOneShotGeoCallbacks.insert(callbackId)
                if shouldRequestLocation {
                    locationManager.requestLocation()
                }
            }

        case .notDetermined:
            if isWatch {
                activeWatchGeoCallbacks.insert(callbackId)
            } else {
                pendingOneShotGeoCallbacks.insert(callbackId)
            }

            locationManager.requestWhenInUseAuthorization()

        case .restricted, .denied:
            sendGeolocationError(
                callbackId: callbackId,
                code: 1,
                message: "Location access was denied. Enable it in Settings to use venue location features."
            )

        @unknown default:
            sendGeolocationError(
                callbackId: callbackId,
                code: 2,
                message: "Location is unavailable right now."
            )
        }
    }

    private func clearGeolocationWatch(callbackId: Int) {
        activeWatchGeoCallbacks.remove(callbackId)

        if activeWatchGeoCallbacks.isEmpty {
            locationManager.stopUpdatingLocation()
        }
    }

    private func flushPendingGeolocationErrors(code: Int, message: String) {
        let pendingOneShots = pendingOneShotGeoCallbacks
        pendingOneShotGeoCallbacks.removeAll()

        let activeWatches = activeWatchGeoCallbacks
        activeWatchGeoCallbacks.removeAll()
        locationManager.stopUpdatingLocation()

        pendingOneShots.forEach { callbackId in
            sendGeolocationError(callbackId: callbackId, code: code, message: message)
        }

        activeWatches.forEach { callbackId in
            sendGeolocationError(callbackId: callbackId, code: code, message: message)
        }
    }

    private func sendGeolocationSuccess(callbackId: Int, location: CLLocation) {
        let coords: [String: Any] = [
            "latitude": location.coordinate.latitude,
            "longitude": location.coordinate.longitude,
            "accuracy": location.horizontalAccuracy,
            "altitude": location.verticalAccuracy >= 0 ? location.altitude : NSNull(),
            "altitudeAccuracy": location.verticalAccuracy >= 0 ? location.verticalAccuracy : NSNull(),
            "heading": location.course >= 0 ? location.course : NSNull(),
            "speed": location.speed >= 0 ? location.speed : NSNull(),
        ]

        let payload: [String: Any] = [
            "coords": coords,
            "timestamp": Int(location.timestamp.timeIntervalSince1970 * 1000),
        ]

        guard let json = serializeToJSON(payload) else {
            sendGeolocationError(
                callbackId: callbackId,
                code: 2,
                message: "Location data could not be prepared."
            )
            return
        }

        webView.evaluateJavaScript("window.__utsavasNativeGeoSuccess(\(callbackId), \(json));")
    }

    private func sendGeolocationError(callbackId: Int, code: Int, message: String) {
        let escapedMessage = serializeToJSON(message) ?? "\"Location unavailable.\""
        webView.evaluateJavaScript(
            "window.__utsavasNativeGeoError(\(callbackId), \(code), \(escapedMessage));"
        )
    }

    private func serializeToJSON(_ value: Any) -> String? {
        if let stringValue = value as? String,
           let data = try? JSONSerialization.data(withJSONObject: [stringValue], options: []),
           let json = String(data: data, encoding: .utf8) {
            return String(json.dropFirst().dropLast())
        }

        guard
            JSONSerialization.isValidJSONObject(value),
            let data = try? JSONSerialization.data(withJSONObject: value, options: []),
            let json = String(data: data, encoding: .utf8)
        else {
            return nil
        }

        return json
    }
}

extension WebViewController: WKNavigationDelegate {
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        hideOfflineState()
        updateNavigationControls()
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        refreshControl.endRefreshing()
        hideOfflineState()
        updateProgressView()
        updateNavigationControls()
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }

        if navigationAction.targetFrame == nil {
            handlePopupNavigation(for: url)
            decisionHandler(.cancel)
            return
        }

        if shouldOpenExternally(url) {
            openExternal(url)
            decisionHandler(.cancel)
            return
        }

        decisionHandler(.allow)
    }

    func webView(
        _ webView: WKWebView,
        didFail navigation: WKNavigation!,
        withError error: Error
    ) {
        handleNavigationFailure(error)
        updateNavigationControls()
    }

    func webView(
        _ webView: WKWebView,
        didFailProvisionalNavigation navigation: WKNavigation!,
        withError error: Error
    ) {
        handleNavigationFailure(error)
        updateNavigationControls()
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        webView.reload()
        updateNavigationControls()
    }
}

extension WebViewController: WKUIDelegate {
    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if let url = navigationAction.request.url {
            handlePopupNavigation(for: url)
        }

        return nil
    }

    func webView(
        _ webView: WKWebView,
        runOpenPanelWith parameters: WKOpenPanelParameters,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping ([URL]?) -> Void
    ) {
        beginFileSelection(parameters: parameters, completionHandler: completionHandler)
    }

    func webView(
        _ webView: WKWebView,
        runJavaScriptAlertPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping () -> Void
    ) {
        let alert = UIAlertController(title: AppConfig.appName, message: message, preferredStyle: .alert)
        alert.addAction(
            UIAlertAction(title: "OK", style: .default) { _ in
                completionHandler()
            }
        )
        present(alert, animated: true)
    }

    func webView(
        _ webView: WKWebView,
        runJavaScriptConfirmPanelWithMessage message: String,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping (Bool) -> Void
    ) {
        let alert = UIAlertController(title: AppConfig.appName, message: message, preferredStyle: .alert)
        alert.addAction(
            UIAlertAction(title: "Cancel", style: .cancel) { _ in
                completionHandler(false)
            }
        )
        alert.addAction(
            UIAlertAction(title: "OK", style: .default) { _ in
                completionHandler(true)
            }
        )
        present(alert, animated: true)
    }

    func webView(
        _ webView: WKWebView,
        runJavaScriptTextInputPanelWithPrompt prompt: String,
        defaultText: String?,
        initiatedByFrame frame: WKFrameInfo,
        completionHandler: @escaping (String?) -> Void
    ) {
        let alert = UIAlertController(title: AppConfig.appName, message: prompt, preferredStyle: .alert)
        alert.addTextField { textField in
            textField.text = defaultText
        }
        alert.addAction(
            UIAlertAction(title: "Cancel", style: .cancel) { _ in
                completionHandler(nil)
            }
        )
        alert.addAction(
            UIAlertAction(title: "OK", style: .default) { _ in
                completionHandler(alert.textFields?.first?.text)
            }
        )
        present(alert, animated: true)
    }
}

extension WebViewController: UIDocumentPickerDelegate {
    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        finishFileSelection(with: urls)
    }

    func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        finishFileSelection(with: nil)
    }
}

extension WebViewController: PHPickerViewControllerDelegate {
    func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
        picker.dismiss(animated: true)

        guard !results.isEmpty else {
            finishFileSelection(with: nil)
            return
        }

        let group = DispatchGroup()
        let lock = NSLock()
        var copiedURLs = [URL]()

        for result in results {
            let provider = result.itemProvider
            let typeIdentifier = provider.registeredTypeIdentifiers.first ?? UTType.image.identifier

            group.enter()
            provider.loadFileRepresentation(forTypeIdentifier: typeIdentifier) { sourceURL, _ in
                defer { group.leave() }

                guard let sourceURL else {
                    return
                }

                let pathExtension = sourceURL.pathExtension.isEmpty ? "jpg" : sourceURL.pathExtension
                let destinationURL = FileManager.default.temporaryDirectory
                    .appendingPathComponent(UUID().uuidString)
                    .appendingPathExtension(pathExtension)

                do {
                    try FileManager.default.copyItem(at: sourceURL, to: destinationURL)
                    lock.lock()
                    copiedURLs.append(destinationURL)
                    lock.unlock()
                } catch {
                    return
                }
            }
        }

        group.notify(queue: .main) { [weak self] in
            guard let self else {
                return
            }

            self.replaceTemporaryUploadURLs(with: copiedURLs)
            self.finishFileSelection(with: copiedURLs.isEmpty ? nil : copiedURLs)
        }
    }
}

extension WebViewController: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true) { [weak self] in
            self?.finishFileSelection(with: nil)
        }
    }

    func imagePickerController(
        _ picker: UIImagePickerController,
        didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
    ) {
        let selectedImage =
            (info[.editedImage] as? UIImage) ??
            (info[.originalImage] as? UIImage)

        picker.dismiss(animated: true) { [weak self] in
            guard let self, let image = selectedImage, let imageData = image.jpegData(compressionQuality: 0.9) else {
                self?.finishFileSelection(with: nil)
                return
            }

            let destinationURL = FileManager.default.temporaryDirectory
                .appendingPathComponent(UUID().uuidString)
                .appendingPathExtension("jpg")

            do {
                try imageData.write(to: destinationURL, options: .atomic)
                self.replaceTemporaryUploadURLs(with: [destinationURL])
                self.finishFileSelection(with: [destinationURL])
            } catch {
                self.finishFileSelection(with: nil)
            }
        }
    }
}

extension WebViewController: CLLocationManagerDelegate {
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        switch manager.authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            if !pendingOneShotGeoCallbacks.isEmpty {
                manager.requestLocation()
            }

            if !activeWatchGeoCallbacks.isEmpty {
                manager.startUpdatingLocation()
            }

        case .restricted, .denied:
            flushPendingGeolocationErrors(
                code: 1,
                message: "Location access was denied. Enable it in Settings to use venue location features."
            )

        case .notDetermined:
            break

        @unknown default:
            flushPendingGeolocationErrors(
                code: 2,
                message: "Location is unavailable right now."
            )
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else {
            return
        }

        let oneShotCallbacks = pendingOneShotGeoCallbacks
        pendingOneShotGeoCallbacks.removeAll()

        oneShotCallbacks.forEach { callbackId in
            sendGeolocationSuccess(callbackId: callbackId, location: location)
        }

        activeWatchGeoCallbacks.forEach { callbackId in
            sendGeolocationSuccess(callbackId: callbackId, location: location)
        }

        if activeWatchGeoCallbacks.isEmpty {
            manager.stopUpdatingLocation()
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        let oneShotCallbacks = pendingOneShotGeoCallbacks
        pendingOneShotGeoCallbacks.removeAll()

        oneShotCallbacks.forEach { callbackId in
            sendGeolocationError(
                callbackId: callbackId,
                code: 2,
                message: error.localizedDescription
            )
        }

        activeWatchGeoCallbacks.forEach { callbackId in
            sendGeolocationError(
                callbackId: callbackId,
                code: 2,
                message: error.localizedDescription
            )
        }
    }
}

extension WebViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard
            message.name == Self.geolocationHandlerName,
            let body = message.body as? [String: Any],
            let type = body["type"] as? String
        else {
            return
        }

        let callbackId: Int
        if let intValue = body["callbackId"] as? Int {
            callbackId = intValue
        } else if let numberValue = body["callbackId"] as? NSNumber {
            callbackId = numberValue.intValue
        } else {
            return
        }

        switch type {
        case "getCurrentPosition":
            handleGeolocationRequest(callbackId: callbackId, isWatch: false)

        case "watchPosition":
            handleGeolocationRequest(callbackId: callbackId, isWatch: true)

        case "clearWatch":
            clearGeolocationWatch(callbackId: callbackId)

        default:
            break
        }
    }
}

private final class WeakScriptMessageHandler: NSObject, WKScriptMessageHandler {
    weak var delegate: WKScriptMessageHandler?

    init(delegate: WKScriptMessageHandler) {
        self.delegate = delegate
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        delegate?.userContentController(userContentController, didReceive: message)
    }
}

private extension UIColor {
    static let utsavasBackground = UIColor(red: 244.0 / 255.0, green: 236.0 / 255.0, blue: 223.0 / 255.0, alpha: 1)
    static let utsavasPrimary = UIColor(red: 63.0 / 255.0, green: 111.0 / 255.0, blue: 182.0 / 255.0, alpha: 1)
    static let utsavasText = UIColor(red: 39.0 / 255.0, green: 39.0 / 255.0, blue: 44.0 / 255.0, alpha: 1)
}
