import SwiftUI

// Thin native shell around the web app. The site does the work; this adds a
// real install, full-screen chrome, and local notifications for reminders.

@main
struct Gym321App: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
        }
    }
}

enum Config {
    static let appURL = URL(string: "https://web-production-032ec.up.railway.app/")!
}
