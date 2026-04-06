import Foundation

enum AppConfig {
    static let appName = "UTSAVAS"
    static let initialURL = URL(string: "https://utsavas.com")!

    static let inAppHosts: Set<String> = {
        var hosts = Set<String>()

        if let host = normalizedHost(from: initialURL) {
            hosts.insert(host)
        }

        hosts.insert("checkout.razorpay.com")
        hosts.insert("api.razorpay.com")

        return hosts
    }()

    static func shouldOpenInApp(_ url: URL) -> Bool {
        guard
            let scheme = url.scheme?.lowercased(),
            scheme == "http" || scheme == "https",
            let host = normalizedHost(from: url)
        else {
            return false
        }

        return inAppHosts.contains(host)
    }

    private static func normalizedHost(from url: URL) -> String? {
        guard let host = url.host?.lowercased() else {
            return nil
        }

        if host.hasPrefix("www.") {
            return String(host.dropFirst(4))
        }

        return host
    }
}
