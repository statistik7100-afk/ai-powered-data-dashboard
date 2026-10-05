"use client";

import { useDashboard } from "@/context/DashboardContext";

export default function TopAppBar() {
  const { theme, toggleTheme, language, setLanguage, isMockMode, toggleMockMode } = useDashboard();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--md-sys-color-border-subtle)] bg-[var(--md-sys-color-surface)]/95 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--md-sys-color-primary)] text-white shadow-sm transition-transform hover:scale-105">
            {/* Google-inspired analytics chart icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-[var(--md-sys-color-on-surface)]">
                AI Analytics Studio
              </span>
              <span className="rounded-full bg-[var(--md-sys-color-primary-container)] px-2 py-0.5 text-[10px] font-semibold text-[var(--md-sys-color-on-primary-container)]">
                Material 3
              </span>
            </div>
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
              Powered by Google Gemini 1.5 Pro
            </span>
          </div>
        </div>

        {/* Center / Nav Items (Desktop) */}
        <nav className="hidden items-center gap-1 md:flex">
          {["Dashboard", "Dataset Acuan", "Panduan"].map((item, idx) => (
            <button
              key={item}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                idx === 0
                  ? "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] font-semibold"
                  : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Right Actions: Lang, Mock Mode, Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Mock Mode Pill */}
          <button
            onClick={toggleMockMode}
            className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all border ${
              isMockMode
                ? "bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)] border-[var(--md-sys-color-warning)]/30"
                : "bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]"
            }`}
            title="Klik untuk beralih mode API"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isMockMode ? "bg-amber-600 animate-pulse" : "bg-emerald-600"
              }`}
            />
            <span>{isMockMode ? "Mock Data" : "Gemini API"}</span>
          </button>

          {/* Language Switcher (Segmented Button M3) */}
          <div className="flex items-center rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-0.5">
            <button
              onClick={() => setLanguage("id")}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${
                language === "id"
                  ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-sm"
                  : "text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase transition-all ${
                language === "en"
                  ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shadow-sm"
                  : "text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle (M3 Icon Button) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light/dark theme"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]"
            title={theme === "light" ? "Beralih ke Dark Theme" : "Beralih ke Light Theme (Default)"}
          >
            {theme === "light" ? (
              /* Moon icon for light mode (click to switch to dark) */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              /* Sun icon for dark mode (click to switch to light) */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 text-amber-300"
              >
                <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
