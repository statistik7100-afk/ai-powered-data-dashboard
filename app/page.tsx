"use client";

import { useState } from "react";
import CsvUploader from "@/components/CsvUploader";
import { useDashboard } from "@/context/DashboardContext";
import DynamicChart from "@/components/DynamicChart";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import DataTemplateGuide from "@/components/DataTemplateGuide";
import CustomMetadataBuilder from "@/components/CustomMetadataBuilder";

export default function Home() {
  const [uploadMode, setUploadMode] = useState<"custom" | "preset">("custom");

  const {
    rawData,
    fileName,
    fileSize,
    isAnalyzing,
    aiReport,
    error,
    language,
    processDataset,
    processDatasetWithUserMetadata,
    reset,
    activeTemplateId,
    setActiveTemplateId,
    validationReport,
    tableMetadata,
  } = useDashboard();

  const hasFile = !!fileName;
  const showDashboard = !!aiReport;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const t = {
    id: {
      heroTitle: "Ubah Data Anda Menjadi",
      heroSubtitle: "Insight Eksekutif",
      heroDescription: "Unggah file CSV apa pun dan dapatkan analitik buatan AI, bagan interaktif, dan ringkasan siap presentasi dalam hitungan detik dengan prinsip Google Material 3.",
      poweredBy: "Didukung oleh Google Gemini 1.5 Pro",
      analyzing: "Sedang Menganalisis...",
      complete: "Selesai",
      statusWorking: "Gemini sedang membaca struktur dan pola data Anda...",
      statusReady: "Dashboard siap disajikan",
      rowsParsed: "Baris Diproses",
      colsDetected: "Kolom Terdeteksi",
      chartType: "Tipe Bagan",
      statusLabel: "Status Sistem",
      statusIdle: "Menunggu",
      statusWorkingShort: "Bekerja",
      statusDone: "Selesai ✓",
      dataViz: "Visualisasi Data",
      execSummary: "Ringkasan Eksekutif",
      recommended: "Rekomendasi AI:",
      awaitingData: "Menunggu data CSV diunggah",
      narrativeAwaiting: "Narasi akan muncul di sini",
      boardReady: "Insight siap presentasi setelah file diunggah",
      analysisComplete: "Analisis Selesai",
      geminiIdentified: "Gemini 1.5 Pro mengidentifikasi pola kunci. Visualisasi disinkronkan."
    },
    en: {
      heroTitle: "Transform Your Data into",
      heroSubtitle: "Executive Insights",
      heroDescription: "Upload any CSV file and receive AI-generated analytics, interactive charts, and board-ready summaries in seconds with Google Material 3 principles.",
      poweredBy: "Powered by Google Gemini 1.5 Pro",
      analyzing: "Analyzing...",
      complete: "Complete",
      statusWorking: "Gemini is reading data patterns...",
      statusReady: "Dashboard ready to view",
      rowsParsed: "Rows Parsed",
      colsDetected: "Columns Detected",
      chartType: "Chart Type",
      statusLabel: "System Status",
      statusIdle: "Idle",
      statusWorkingShort: "Working",
      statusDone: "Done ✓",
      dataViz: "Data Visualization",
      execSummary: "Executive Summary",
      recommended: "AI recommended:",
      awaitingData: "Awaiting CSV data upload",
      narrativeAwaiting: "Narrative will appear here",
      boardReady: "Board-ready insights after upload",
      analysisComplete: "Analysis Complete",
      geminiIdentified: "Gemini 1.5 Pro identified key patterns. Visualizations synchronized."
    }
  }[language];

  return (
    <div className="space-y-8 md:space-y-10 pb-10">

      {/* ── HERO SECTION (M3 Editorial Style) ─────────────── */}
      <section className="relative pt-4 sm:pt-6 text-center transition-all duration-300">
        <div className="flex flex-col items-center gap-3">
          {/* M3 Assist Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] px-3.5 py-1.5 text-xs font-semibold text-[var(--md-sys-color-primary)] shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[var(--md-sys-color-primary)] animate-pulse" />
            {t.poweredBy}
          </div>
        </div>

        <h1
          className={`mt-4 font-bold tracking-tight text-[var(--md-sys-color-on-surface)] transition-all duration-300 ${
            showDashboard ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl lg:text-5xl"
          }`}
        >
          {t.heroTitle}{" "}
          <span className="text-[var(--md-sys-color-primary)]">
            {t.heroSubtitle}
          </span>
        </h1>

        {!showDashboard && (
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            {t.heroDescription}
          </p>
        )}
      </section>

      {/* ── UPLOAD / STATUS BANNER ────────────────────────── */}
      <section id="upload-section" className="flex flex-col items-center gap-6">
        {!hasFile ? (
          /* Empty State — Show M3 Segmented Buttons & Active Flow */
          <div className="w-full max-w-4xl space-y-6">
            {/* Mode Switcher (Google M3 Segmented Button) */}
            <div className="flex items-center justify-center">
              <div className="inline-flex rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setUploadMode("custom")}
                  className={`flex items-center gap-2 rounded-full px-4 sm:px-6 py-2 text-xs font-medium transition-all ${
                    uploadMode === "custom"
                      ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold shadow-xs"
                      : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]"
                  }`}
                >
                  <span>⚙️</span>
                  <span>Tentukan Metadata Sendiri (Fleksibel)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMode("preset")}
                  className={`flex items-center gap-2 rounded-full px-4 sm:px-6 py-2 text-xs font-medium transition-all ${
                    uploadMode === "preset"
                      ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold shadow-xs"
                      : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]"
                  }`}
                >
                  <span>📘</span>
                  <span>Template Acuan Industri (Sales/Stok/Ads)</span>
                </button>
              </div>
            </div>

            {uploadMode === "custom" ? (
              <CustomMetadataBuilder
                onDatasetReady={processDatasetWithUserMetadata}
                isProcessing={isAnalyzing}
              />
            ) : (
              <div className="w-full space-y-4">
                <DataTemplateGuide
                  onSelectTemplate={setActiveTemplateId}
                  activeTemplateId={activeTemplateId}
                />
                <CsvUploader onFileAccepted={processDataset} />
              </div>
            )}
          </div>
        ) : (
          /* File banner — Analyzing or Done (M3 Elevated Card) */
          <div
            id="file-accepted-banner"
            className="m3-card-elevated w-full max-w-3xl p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center gap-4">
              {/* Status icon with M3 tonal container */}
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-primary)]">
                {isAnalyzing ? (
                  <svg
                    className="h-5 w-5 animate-spin"
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
                    className="h-6 w-6 text-[var(--md-sys-color-primary)]"
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
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-base font-semibold text-[var(--md-sys-color-on-surface)]">
                    {tableMetadata?.tableName || fileName}
                  </p>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isAnalyzing
                        ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                        : "bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)]"
                    }`}
                  >
                    {isAnalyzing ? t.analyzing : t.complete}
                  </span>
                  {validationReport && (
                    <span
                      className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                        validationReport.healthScore >= 80
                          ? "border-[var(--md-sys-color-success)]/30 bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)]"
                          : "border-[var(--md-sys-color-warning)]/30 bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)]"
                      }`}
                    >
                      🛡️ Kualitas Data: {validationReport.healthScore}%
                    </span>
                  )}
                  {tableMetadata?.primaryKpi && (
                    <span className="flex-shrink-0 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] px-2.5 py-0.5 text-[10px] font-semibold">
                      🎯 KPI: {tableMetadata.primaryKpi}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                  {fileSize ? formatFileSize(fileSize) : ""} &bull;{" "}
                  {isAnalyzing ? t.statusWorking : t.statusReady}
                </p>
                {/* Linear Progress Bar (Google M3) */}
                <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--md-sys-color-surface-container-high)] overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-[var(--md-sys-color-primary)] transition-all duration-700 ${
                      isAnalyzing ? "w-2/3 animate-pulse" : "w-full"
                    }`}
                  />
                </div>
              </div>

              {/* Reset Button (M3 Icon Button) */}
              <button
                id="reset-upload"
                onClick={reset}
                aria-label="Upload a new file"
                title="Ganti atau upload file baru"
                className="flex-shrink-0 rounded-full p-2 text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:bg-[var(--md-sys-color-surface-container-high)] hover:text-[var(--md-sys-color-on-surface)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            {/* Custom Table Description Banner */}
            {tableMetadata?.tableDescription && (
              <div className="pt-3 border-t border-[var(--md-sys-color-border-subtle)] text-xs text-[var(--md-sys-color-on-surface)] flex items-start gap-2">
                <span className="text-[var(--md-sys-color-primary)] font-semibold">Tujuan Analisis:</span>
                <span className="italic text-[var(--md-sys-color-on-surface-variant)]">{tableMetadata.tableDescription}</span>
              </div>
            )}

            {/* Validation Notice if issues exist */}
            {validationReport && validationReport.issues.length > 0 && (
              <div className="pt-2 border-t border-[var(--md-sys-color-border-subtle)] space-y-1">
                {validationReport.issues.slice(0, 2).map((issue, idx) => (
                  <p
                    key={idx}
                    className={`text-[11px] flex items-center gap-1.5 ${
                      issue.type === "error"
                        ? "text-[var(--md-sys-color-error)]"
                        : "text-[var(--md-sys-color-warning)]"
                    }`}
                  >
                    <span>{issue.type === "error" ? "⚠️" : "ℹ️"}</span>
                    <span>{issue.message}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Banner (M3 Error Container) */}
        {error && (
          <div
            id="analysis-error"
            role="alert"
            className="w-full max-w-2xl flex items-start gap-3 rounded-2xl border border-[var(--md-sys-color-error)]/30 bg-[var(--md-sys-color-error-container)] px-5 py-4 text-sm text-[var(--md-sys-color-on-error-container)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--md-sys-color-error)]"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-semibold">Analysis failed</p>
              <p className="mt-0.5 text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}
      </section>

      {/* ── STAT CARDS (M3 Elevated Cards) ───────────────── */}
      <section
        id="stats-grid"
        className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            label: t.rowsParsed,
            value: rawData.length > 0 ? rawData.length.toLocaleString() : "—",
            icon: "📊",
          },
          {
            label: t.colsDetected,
            value:
              rawData.length > 0
                ? Object.keys(rawData[0]).length.toString()
                : "—",
            icon: "🧠",
          },
          {
            label: t.chartType,
            value: aiReport ? aiReport.chartRecommendation.type.toUpperCase() : "—",
            icon: "⚡",
          },
          {
            label: t.statusLabel,
            value: isAnalyzing ? t.statusWorkingShort : aiReport ? t.statusDone : t.statusIdle,
            icon: "🎯",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="m3-card-elevated p-5 sm:p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
                {stat.label}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--md-sys-color-surface-container)] text-lg">
                {stat.icon}
              </span>
            </div>
            <p
              className={`text-2xl sm:text-3xl font-bold tracking-tight transition-all duration-300 ${
                stat.value !== "—"
                  ? "text-[var(--md-sys-color-on-surface)]"
                  : "text-[var(--md-sys-color-text-subtle)]"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* ── MAIN DASHBOARD (Chart + Summary) ─────────────── */}
      <section
        id="dashboard-content"
        className={`grid grid-cols-1 gap-6 lg:grid-cols-3 transition-all duration-300 ${
          !hasFile ? "opacity-60 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Chart (M3 Elevated Container) */}
        <div className="m3-card-elevated col-span-2 flex min-h-[440px] flex-col p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
                {t.dataViz}
              </h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                {aiReport
                  ? `${t.recommended} ${aiReport.chartRecommendation.type} chart`
                  : isAnalyzing
                  ? t.analyzing
                  : t.awaitingData}
              </p>
            </div>
            {aiReport && (
              <span className="rounded-full bg-[var(--md-sys-color-surface-container-high)] px-3 py-1 text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)] border border-[var(--md-sys-color-border-subtle)]">
                {aiReport.chartRecommendation.xAxisKey} /{" "}
                {aiReport.chartRecommendation.yAxisKey}
              </span>
            )}
          </div>

          <div className="flex-1">
            {aiReport ? (
              <DynamicChart
                data={aiReport.chartRecommendation.chartData || rawData}
                type={aiReport.chartRecommendation.type}
                xAxisKey={aiReport.chartRecommendation.xAxisKey}
                yAxisKey={aiReport.chartRecommendation.yAxisKey}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center py-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                  {isAnalyzing ? (
                    <svg className="h-6 w-6 animate-spin text-[var(--md-sys-color-primary)]" viewBox="0 0 24 24">
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
                <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                  {isAnalyzing ? t.analyzing : t.awaitingData}
                </p>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                  {isAnalyzing
                    ? "AI is selecting the best chart for your dataset"
                    : "Chart will render automatically after analysis"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Executive Summary (M3 Elevated Container) */}
        <div className="m3-card-elevated flex min-h-[440px] flex-col p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]">
              {t.execSummary}
            </h2>
            {aiReport && (
              <span className="rounded-full bg-[var(--md-sys-color-primary-container)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--md-sys-color-on-primary-container)]">
                {language === "id" ? "Hasil AI" : "AI Generated"}
              </span>
            )}
          </div>

          <div className="flex-1">
            <ExecutiveSummary
              summary={aiReport?.executiveSummary ?? ""}
              isAnalyzing={isAnalyzing}
            />

            {!aiReport && !isAnalyzing && (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                <p className="text-4xl opacity-20">📑</p>
                <p className="mt-3 text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                  {t.narrativeAwaiting}
                </p>
                <p className="mt-1 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                  {t.boardReady}
                </p>
              </div>
            )}
          </div>

          {aiReport && (
            <div className="mt-6 rounded-2xl border border-[var(--md-sys-color-border-subtle)] bg-[var(--md-sys-color-surface-container)] p-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--md-sys-color-primary)]" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                  {t.analysisComplete}
                </p>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                {t.geminiIdentified}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
