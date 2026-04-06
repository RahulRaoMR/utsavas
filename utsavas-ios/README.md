# UTSAVAS iOS App

This folder contains an iPhone-ready iOS wrapper for the live `https://utsavas.com` site so you can open it in Xcode on a Mac and archive it for the App Store.

## What is already configured

- App name: `UTSAVAS`
- Bundle ID: `com.talme.utsavas`
- Marketing version: `1.0.3`
- Build number: `1`
- iPhone target: iOS `15.0+`
- Release URL: `https://utsavas.com`
- Features included:
  - `WKWebView` loading for the main UTSAVAS site
  - Native bottom navigation for back, forward, home, refresh, and share
  - Pull to refresh
  - Popup handling for payment and target-blank links
  - External app/browser opening for links like phone, email, maps, and social apps
  - Offline retry screen
  - File, photo library, and camera support for HTML file inputs
  - JavaScript `alert`, `confirm`, and `prompt` dialogs
  - Native location bridge for website geolocation requests
  - App icon set generated from your existing UTSAVAS web assets

## Open In Xcode

1. Copy the repo to a Mac with Xcode installed.
2. Open the `utsavas-ios/UtsavasIOS.xcodeproj` project.
3. In the `UtsavasIOS` target, set your Apple Developer Team under `Signing & Capabilities`.
4. If Apple says the bundle ID is already used by another app in your account, change `PRODUCT_BUNDLE_IDENTIFIER` in the target build settings.
5. Connect an iPhone or select an iOS Simulator and run the app.

## Test Before Upload

Check these flows on a real iPhone before archiving:

- home page loading
- login and register
- hall browsing
- booking flow
- Razorpay payment flow
- file uploads
- venue maps and geolocation
- external links such as phone, WhatsApp, email, and maps

## Build The App Store Archive

1. In Xcode, choose the `UtsavasIOS` scheme and a generic iPhone device.
2. Open `Product > Archive`.
3. When the archive finishes, Xcode Organizer will open automatically.
4. Choose `Distribute App`.
5. Select `App Store Connect`.
6. Follow the signing prompts and upload the build.

## App Store Notes

- Until April 27, 2026, App Store Connect accepts iOS builds made with Xcode 16 and the iOS 18 SDK or later.
- Starting April 28, 2026, Apple requires iOS uploads to be built with Xcode 26 and the iOS 26 SDK or later.
- Apple also requires the updated App Store age rating questions to be answered in App Store Connect for submissions made in 2026.
- Because this app is a webview-based product, make sure you complete the App Privacy answers for data collected through the UTSAVAS site before submission.

## Files You Will Most Likely Edit

- `UtsavasIOS/Info.plist`
- `UtsavasIOS/AppConfig.swift`
- `UtsavasIOS.xcodeproj/project.pbxproj`

## Important Limitation From This Environment

This workspace is running on Windows without Xcode or the iOS SDK, so the project was scaffolded here but not compiled or archived here. The final App Store build must be opened, signed, tested, and archived in Xcode on a Mac.
