import SwiftUI
import WebKit
import UserNotifications

final class WebModel: ObservableObject {
    @Published var failed = false
    weak var webView: WKWebView?

    func reload() {
        failed = false
        webView?.load(URLRequest(url: Config.appURL))
    }
}

struct WebView: UIViewRepresentable {
    @ObservedObject var model: WebModel

    func makeCoordinator() -> Coordinator { Coordinator(model: model) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.websiteDataStore = .default() // persistent: cookies survive relaunch
        // Bridge: web calls window.webkit.messageHandlers.reminders.postMessage({...})
        config.userContentController.add(context.coordinator, name: "reminders")
        // Let the page know it is inside the shell.
        let flag = WKUserScript(source: "window.__gym321Native = true;", injectionTime: .atDocumentStart, forMainFrameOnly: true)
        config.userContentController.addUserScript(flag)

        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.uiDelegate = context.coordinator
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.scrollView.bounces = true
        web.isOpaque = false
        web.backgroundColor = UIColor(red: 0.078, green: 0.067, blue: 0.063, alpha: 1)
        web.allowsBackForwardNavigationGestures = true

        let refresh = UIRefreshControl()
        refresh.tintColor = UIColor(red: 0.863, green: 0.769, blue: 0.643, alpha: 1)
        refresh.addTarget(context.coordinator, action: #selector(Coordinator.pulled(_:)), for: .valueChanged)
        web.scrollView.refreshControl = refresh

        model.webView = web
        web.load(URLRequest(url: Config.appURL))
        return web
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
        let model: WebModel
        init(model: WebModel) { self.model = model }

        @objc func pulled(_ sender: UIRefreshControl) {
            model.webView?.reload()
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            webView.scrollView.refreshControl?.endRefreshing()
            model.failed = false
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            webView.scrollView.refreshControl?.endRefreshing()
            if webView.url == nil || webView.url == Config.appURL { model.failed = true }
        }

        // Keep the app's own origin in the shell; everything else (youtube, sources) opens in Safari.
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = action.request.url, action.navigationType == .linkActivated else { decisionHandler(.allow); return }
            if url.host == Config.appURL.host { decisionHandler(.allow); return }
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
        }

        // target=_blank links.
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = action.request.url { UIApplication.shared.open(url) }
            return nil
        }

        // { days: [1,3,5] (0=sunday), hour: 18, minute: 30, minutes: 45 }  or  { clear: true }
        func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "reminders", let body = message.body as? [String: Any] else { return }
            let center = UNUserNotificationCenter.current()
            center.removePendingNotificationRequests(withIdentifiers: Reminders.ids)
            if body["clear"] as? Bool == true { return }
            guard let days = body["days"] as? [Int], let hour = body["hour"] as? Int, let minute = body["minute"] as? Int else { return }
            center.requestAuthorization(options: [.alert, .sound]) { granted, _ in
                guard granted else { return }
                for day in days {
                    var date = DateComponents()
                    date.weekday = day + 1 // UNCalendar: 1 = sunday
                    date.hour = hour
                    date.minute = minute
                    let content = UNMutableNotificationContent()
                    content.title = "gym"
                    content.body = Reminders.lines.randomElement() ?? "downstairs."
                    content.sound = .default
                    let trigger = UNCalendarNotificationTrigger(dateMatching: date, repeats: true)
                    center.add(UNNotificationRequest(identifier: "gym.reminder.\(day)", content: content, trigger: trigger))
                }
            }
        }
    }
}

enum Reminders {
    static let ids = (0...6).map { "gym.reminder.\($0)" }
    static let lines = [
        "the gym is downstairs. you were going to be in it.",
        "difficulties strengthen the mind, as labor does the body. — seneca",
        "in the morning when you rise unwillingly: i am rising to the work of a human being. — marcus aurelius",
        "it is difficulties that show what men are. — epictetus",
        "twenty minutes counts.",
    ]
}
