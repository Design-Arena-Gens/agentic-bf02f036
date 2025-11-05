import "../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "McDonald's AI Agent",
  description: "Chat with a McDonald's assistant to explore menu, nutrition, and build orders.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-mcd-yellow/10 text-mcd-dark">
        <div className="mx-auto max-w-3xl p-4">
          <header className="flex items-center gap-3 py-6">
            <div className="h-10 w-10 rounded-full bg-mcd-gold ring-4 ring-mcd-red" />
            <div>
              <h1 className="text-2xl font-bold">McDonald's AI Agent</h1>
              <p className="text-sm text-neutral-600">Browse the menu, check nutrition, and build your order.</p>
            </div>
          </header>
          <main>{children}</main>
          <footer className="py-10 text-center text-xs text-neutral-500">Unofficial demo assistant</footer>
        </div>
      </body>
    </html>
  );
}
