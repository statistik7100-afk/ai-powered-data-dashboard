import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DashboardProvider } from "@/context/DashboardContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Data Dashboard | Transform CSV into Executive Insights",
  description:
    "An enterprise-grade AI-powered analytics dashboard. Upload any CSV and receive interactive visualizations and executive summaries in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gradient-mesh min-h-screen">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0f1e]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-teal-500 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4 text-white"
                >
                  <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
                </svg>
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-100">
                AI Dashboard
              </span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-indigo-400 ring-1 ring-indigo-500/20">
                Beta
              </span>
            </div>

            {/* Nav Links */}
            <nav className="hidden items-center gap-6 md:flex">
              {["Dashboard", "Reports", "Settings"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-slate-400 transition-colors duration-150 hover:text-slate-100"
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 animate-pulse rounded-full bg-teal-400" />
              <span className="hidden text-xs text-slate-400 sm:block">
                Ready
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <DashboardProvider>
          <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
        </DashboardProvider>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/[0.06] py-6 text-center text-xs text-slate-600">
          AI Data Dashboard &copy; {new Date().getFullYear()} &mdash; Built with
          Next.js 14, OpenAI & Tailwind CSS
        </footer>
      </body>
    </html>
  );
}
