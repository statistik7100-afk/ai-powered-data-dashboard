import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "@/context/DashboardContext";
import TopAppBar from "@/components/TopAppBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Analytics Studio | Google Material 3 Data Dashboard",
  description:
    "An enterprise-grade AI analytics dashboard built with Google Material Design 3 and powered by Google Gemini 1.5 Pro.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('app_theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--md-sys-color-background)] text-[var(--md-sys-color-on-surface)] selection:bg-[var(--md-sys-color-primary-container)] selection:text-[var(--md-sys-color-on-primary-container)]">
        <DashboardProvider>
          {/* Top Navigation Bar (M3 Top App Bar) */}
          <TopAppBar />

          {/* Main Content Canvas */}
          <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-10">
            {children}
          </main>

          {/* Footer (M3 Editorial Style) */}
          <footer className="mt-20 border-t border-[var(--md-sys-color-border-subtle)] bg-[var(--md-sys-color-surface)] py-8 text-center text-xs text-[var(--md-sys-color-on-surface-variant)] transition-colors">
            <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--md-sys-color-on-surface)]">AI Analytics Studio</span>
                <span>&bull;</span>
                <span>Material Design 3 (M3)</span>
              </div>
              <p>
                Powered by Google Gemini 1.5 Pro &mdash; Built with Next.js & Tailwind CSS
              </p>
            </div>
          </footer>
        </DashboardProvider>
      </body>
    </html>
  );
}
