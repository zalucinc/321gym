import SwiftUI

struct ContentView: View {
    @StateObject private var model = WebModel()

    var body: some View {
        ZStack {
            Color(red: 0.078, green: 0.067, blue: 0.063).ignoresSafeArea() // #141110

            WebView(model: model)
                .ignoresSafeArea(edges: .bottom)
                .opacity(model.failed ? 0 : 1)

            if model.failed {
                VStack(spacing: 16) {
                    Text("no connection.")
                        .font(.system(.title2, design: .serif))
                    Text("the app needs signal to load once; after that it works offline.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                    Button("try again") { model.reload() }
                        .buttonStyle(.borderedProminent)
                        .tint(Color(red: 0.788, green: 0.471, blue: 0.357)) // terracotta
                }
                .padding(32)
                .textCase(.lowercase)
            }
        }
    }
}
