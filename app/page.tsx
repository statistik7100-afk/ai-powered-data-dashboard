"use client";

import CsvUploader from "@/components/CsvUploader";
import { useDashboard } from "@/context/DashboardContext";
import DynamicChart from "@/components/DynamicChart";
import ExecutiveSummary from "@/components/ExecutiveSummary";

export default function Home() {
  const {
    rawData,
    fileName,
    fileSize,
    isAnalyzing,
    aiReport,
    error,
    processDataset,
    reset,
  } = useDashboard();

  const hasFile = !!fileName;
  const showDashboard = !!aiReport;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-10 pb-10">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-8 text-center transition-all duration-500">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-xs font-medium text-indigo-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
          Powered by OpenAI GPT-4o-mini
        </div>

        <h1
          className={`mt-6 font-bold tracking-tight text-slate-50 transition-all duration-500 ${
            showDashboard ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl lg:text-6xl"
          }`}
        >
          Transform Your Data into{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">
            Executive Insights
          </span>
        </h1>

        {!showDashboard && (
          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-400 sm:text-lg">
            Upload any CSV file and receive AI-generated analytics, interactive
            charts, and board-ready summaries in seconds — not hours.
          </p>
        )}
      </section>

      {/* ── UPLOAD / STATUS BANNER ────────────────────────── */}
      <section id="upload-section" className="flex flex-col items-center gap-4">
        {!hasFile ? (
          /* Empty State — Show uploader */
          <CsvUploader onFileAccepted={processDataset} />
        ) : (
          /* File banner — Analyzing or Done */
          <div
            id="file-accepted-banner"
            className="w-full max-w-2xl rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              {/* Status icon */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10">
                {isAnalyzing ? (
                  <svg
                    className="h-4 w-4 animate-spin text-teal-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-teal-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-100">
                    {fileName}
                  </p>
                  <span
                    className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      isAnalyzing
                        ? "bg-indigo-500/15 text-indigo-400"
                        : "bg-teal-500/15 text-teal-400"
                    }`}
                  >
                    {isAnalyzing ? "Analyzing…" : "Complete"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {fileSize ? formatFileSize(fileSize) : ""} —{" "}
                  {isAnalyzing
                    ? "OpenAI is reading your data…"
                    : "Dashboard ready"}
                </p>
                {/* Progress bar */}
                <div className="mt-2 h-0.5 w-full rounded-full bg-white/5">
                  <div
                    className={`h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-teal-500 transition-all duration-700 ${
                      isAnalyzing ? "w-2/3 animate-pulse" : "w-full"
                    }`}
                  />
                </div>
              </div>

              {/* Reset */}
              <button
                id="reset-upload"
                onClick={reset}
                aria-label="Upload a new file"
                className="flex-shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div
            id="analysis-error"
            role="alert"
            className="w-full max-w-2xl flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mt-0.5 h-4 w-4 flex-shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">Analysis failed</p>
              <p className="mt-0.5 text-xs text-red-400/70">{error}</p>
            </div>
          </div>
        )}
      </section>

      {/* ── STAT CARDS (always visible) ───────────────────── */}
      <section
        id="stats-grid"
        className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            label: "Rows Parsed",
            value: rawData.length > 0 ? rawData.length.toLocaleString() : "—",
            icon: "📊",
          },
          {
            label: "Columns Detected",
            value:
              rawData.length > 0
                ? Object.keys(rawData[0]).length.toString()
                : "—",
            icon: "🧠",
          },
          {
            label: "Chart Type",
            value: aiReport ? aiReport.chartRecommendation.type.toUpperCase() : "—",
            icon: "⚡",
          },
          {
            label: "Status",
            value: isAnalyzing ? "Working" : aiReport ? "Done ✓" : "Idle",
            icon: "🎯",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-card rounded-xl p-5 transition-all duration-300"
          >
            <p className="mb-1 text-xl">{stat.icon}</p>
            <p
              className={`text-2xl font-bold transition-all duration-300 ${
                stat.value !== "—" ? "text-slate-100" : "text-slate-600"
              }`}
            >
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* ── MAIN DASHBOARD (chart + summary) ─────────────── */}
      <section
        id="dashboard-content"
        className={`grid grid-cols-1 gap-6 lg:grid-cols-3 transition-all duration-500 ${
          !hasFile ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Chart */}
        <div className="glass-card col-span-2 flex min-h-[420px] flex-col rounded-xl p-8 transition-all duration-300">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Data Visualization
              </h2>
              <p className="text-xs text-slate-500">
                {aiReport
                  ? `AI recommended: ${aiReport.chartRecommendation.type} chart`
                  : isAnalyzing
                  ? "Determining best chart type…"
                  : "Upload a dataset to visualize"}
              </p>
            </div>
            {aiReport && (
              <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-medium text-slate-400 ring-1 ring-white/10">
                {aiReport.chartRecommendation.xAxisKey} /{" "}
                {aiReport.chartRecommendation.yAxisKey}
              </span>
            )}
          </div>

          <div className="flex-1">
            {aiReport ? (
              <DynamicChart
                data={rawData}
                type={aiReport.chartRecommendation.type}
                xAxisKey={aiReport.chartRecommendation.xAxisKey}
                yAxisKey={aiReport.chartRecommendation.yAxisKey}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-500">
                  {isAnalyzing ? (
                    <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                      />
                    </svg>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-400">
                  {isAnalyzing ? "Generating visualization…" : "Awaiting data"}
                </p>
                <p className="text-xs text-slate-600">
                  {isAnalyzing
                    ? "AI is selecting the best chart for your dataset"
                    : "Chart will render automatically after analysis"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="glass-card flex min-h-[420px] flex-col rounded-xl p-8 transition-all duration-300">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100">
              Executive Summary
            </h2>
            {aiReport && (
              <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-teal-400">
                AI Generated
              </span>
            )}
          </div>

          <div className="flex-1">
            <ExecutiveSummary
              summary={aiReport?.executiveSummary ?? ""}
              isAnalyzing={isAnalyzing}
            />

            {!aiReport && !isAnalyzing && (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <p className="text-3xl opacity-10">📑</p>
                <p className="mt-3 text-sm font-medium text-slate-400">
                  Narrative will appear here
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Board-ready insights after upload
                </p>
              </div>
            )}
          </div>

          {aiReport && (
            <div className="mt-6 rounded-xl border border-teal-500/10 bg-teal-500/5 p-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-400/80">
                  Analysis Complete
                </p>
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-teal-400/50">
                GPT-4o-mini identified key patterns. Visualizations synchronized.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
