"use client";

import { useState } from "react";
import { DOMAIN_TEMPLATES } from "@/config/dataset-templates";
import { DomainTemplate, ColumnDefinition } from "@/types/dataset-template";
import { useDashboard } from "@/context/DashboardContext";

interface DataTemplateGuideProps {
  onSelectTemplate?: (templateId: string) => void;
  activeTemplateId?: string;
}

export default function DataTemplateGuide({
  onSelectTemplate,
  activeTemplateId = "sales_revenue",
}: DataTemplateGuideProps) {
  const { language, processDataset } = useDashboard();
  const [selectedId, setSelectedId] = useState<string>(activeTemplateId);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);

  const currentTemplate: DomainTemplate =
    DOMAIN_TEMPLATES.find((t) => t.id === selectedId) || DOMAIN_TEMPLATES[0];

  const handleTabChange = (id: string) => {
    setSelectedId(id);
    if (onSelectTemplate) {
      onSelectTemplate(id);
    }
  };

  const handleLoadSampleDirectly = async (templateId: string) => {
    try {
      setIsLoadingSample(true);
      const res = await fetch(`/templates/${templateId}_sample.csv`);
      if (!res.ok) throw new Error("Gagal mengambil file contoh");
      const blob = await res.blob();
      const file = new File([blob], `${templateId}_sample.csv`, { type: "text/csv" });
      await processDataset(file);
    } catch (err) {
      console.error("Gagal memuat sample CSV:", err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const t = {
    id: {
      guideTitle: "Panduan & Template Acuan Standar",
      guideSubtitle: "Gunakan format acuan ini agar AI dapat mengurai insight bisnis dengan presisi dan grafik tersinkronisasi sempurna.",
      collapse: "Sembunyikan Panduan",
      expand: "Buka Panduan Acuan",
      primaryKpiLabel: "KPI Utama:",
      tabLabel: "Pilih Domain Analisis:",
      previewTableTitle: "1. Pratinjau Bentuk Tabel Acuan (Live Preview)",
      dictionaryTitle: "2. Kamus & Penjelasan Kolom",
      dosAndDontsTitle: "3. Aturan Kebersihan Format Data (Do's & Don'ts)",
      downloadBlank: "Unduh Template Kosong (.CSV)",
      downloadSample: "Unduh Contoh Data Lengkap (.CSV)",
      loadSampleDirectly: "⚡ Coba Gunakan Contoh Data Ini Langsung",
      loadingSample: "Memuat dataset contoh...",
      colMandatory: "Wajib",
      colOptional: "Opsional",
      whyAiNeedsThis: "Fungsi untuk AI:",
    },
    en: {
      guideTitle: "Standard Dataset Guide & Reference Templates",
      guideSubtitle: "Use these standardized schemas so the AI can extract precise business insights and synchronize charts without ambiguity.",
      collapse: "Hide Guide",
      expand: "Show Reference Guide",
      primaryKpiLabel: "Primary KPI:",
      tabLabel: "Select Business Domain:",
      previewTableTitle: "1. Reference Table Live Preview",
      dictionaryTitle: "2. Data Dictionary & Field Explanation",
      dosAndDontsTitle: "3. Data Quality Rules (Do's & Don'ts)",
      downloadBlank: "Download Blank Template (.CSV)",
      downloadSample: "Download Populated Sample (.CSV)",
      loadSampleDirectly: "⚡ Test Directly with This Sample Data",
      loadingSample: "Loading sample dataset...",
      colMandatory: "Required",
      colOptional: "Optional",
      whyAiNeedsThis: "AI Purpose:",
    },
  }[language];

  return (
    <div className="m3-card-elevated w-full max-w-5xl mx-auto mb-8 overflow-hidden transition-all">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--md-sys-color-border-subtle)] bg-[var(--md-sys-color-surface-container)] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--md-sys-color-primary-container)] text-xl text-[var(--md-sys-color-primary)]">
            📘
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--md-sys-color-on-surface)] tracking-tight flex items-center gap-2">
              {t.guideTitle}
              <span className="rounded-full bg-[var(--md-sys-color-success-container)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--md-sys-color-on-success-container)]">
                Google Acuan
              </span>
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">{t.guideSubtitle}</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-4 py-1.5 text-xs font-semibold text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
        >
          {isOpen ? t.collapse : t.expand}
          <span className={`text-[10px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="p-6 space-y-6">
          {/* ── Domain Selector Tabs ───────────────────────────── */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] mb-2">
              {t.tabLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DOMAIN_TEMPLATES.map((tmpl) => {
                const isActive = tmpl.id === selectedId;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => handleTabChange(tmpl.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                      isActive
                        ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/30 ring-2 ring-[var(--md-sys-color-primary)]/20 shadow-xs"
                        : "border-[var(--md-sys-color-border-subtle)] bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container)]"
                    }`}
                  >
                    <span className="text-2xl">{tmpl.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-sm font-semibold truncate ${isActive ? "text-[var(--md-sys-color-primary)] font-bold" : "text-[var(--md-sys-color-on-surface)]"}`}>
                          {tmpl.title}
                        </span>
                        {isActive && (
                          <span className="h-2 w-2 rounded-full bg-[var(--md-sys-color-primary)] animate-pulse" />
                        )}
                      </div>
                      <span className="block text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate mt-0.5">
                        {tmpl.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Domain Context Banner ──────────────────────────── */}
          <div className="rounded-2xl border border-[var(--md-sys-color-border-subtle)] bg-[var(--md-sys-color-surface-container-low)] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <p className="text-[var(--md-sys-color-on-surface-variant)] leading-relaxed max-w-2xl">
              {currentTemplate.description}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">{t.primaryKpiLabel}</span>
              <span className="rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] px-3 py-1 font-mono text-[11px] font-bold">
                {currentTemplate.primaryKpi}
              </span>
            </div>
          </div>

          {/* ── Section 1: Live Table Preview ──────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface)]">
                {t.previewTableTitle}
              </h4>
              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                Menampilkan 5 baris data contoh
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--md-sys-color-border-subtle)] bg-[var(--md-sys-color-surface)] shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--md-sys-color-border-subtle)] bg-[var(--md-sys-color-surface-container)]">
                    {currentTemplate.columns.map((col) => (
                      <th key={col.key} className="py-2.5 px-3.5 font-semibold text-[var(--md-sys-color-on-surface)] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono">{col.key}</span>
                          {col.required ? (
                            <span className="rounded-full bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] px-1.5 py-0.2 text-[9px] font-bold">
                              *
                            </span>
                          ) : (
                            <span className="rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] px-1.5 py-0.2 text-[9px]">
                              opt
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--md-sys-color-border-subtle)]">
                  {currentTemplate.sampleRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors">
                      {currentTemplate.columns.map((col) => (
                        <td
                          key={col.key}
                          className={`py-2 px-3.5 whitespace-nowrap font-mono text-[11px] ${
                            col.role === "metric"
                              ? "text-[var(--md-sys-color-primary)] font-semibold text-right"
                              : col.role === "timestamp"
                              ? "text-[var(--md-sys-color-secondary)]"
                              : "text-[var(--md-sys-color-on-surface)]"
                          }`}
                        >
                          {typeof row[col.key] === "number"
                            ? (row[col.key] as number).toLocaleString("id-ID")
                            : String(row[col.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Section 2: Data Dictionary & Field Guide ───────── */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface)]">
              {t.dictionaryTitle}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentTemplate.columns.map((col: ColumnDefinition) => (
                <div
                  key={col.key}
                  className="rounded-2xl border border-[var(--md-sys-color-border-subtle)] bg-[var(--md-sys-color-surface)] p-3.5 hover:bg-[var(--md-sys-color-surface-container-low)] transition-all text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono font-bold text-[var(--md-sys-color-primary)] text-xs">
                      {col.key}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-[var(--md-sys-color-surface-container-high)] px-2 py-0.5 text-[10px] font-semibold text-[var(--md-sys-color-on-surface-variant)] uppercase">
                        {col.type}
                      </span>
                      <span className="rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] px-2 py-0.5 text-[10px] font-semibold uppercase">
                        {col.role}
                      </span>
                    </div>
                  </div>
                  <p className="text-[var(--md-sys-color-on-surface)] text-[11px] leading-relaxed mb-1">
                    {col.label} {col.unit && <span className="text-[var(--md-sys-color-text-subtle)]">({col.unit})</span>}
                  </p>
                  <p className="text-[var(--md-sys-color-on-surface-variant)] text-[11px] leading-relaxed">
                    <strong className="text-[var(--md-sys-color-on-surface)]">{t.whyAiNeedsThis}</strong> {col.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 3: Do's and Don'ts ──────────────────────── */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface)]">
              {t.dosAndDontsTitle}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl border border-[var(--md-sys-color-success)]/30 bg-[var(--md-sys-color-success-container)]/30 p-4 space-y-2">
                <span className="font-bold text-[var(--md-sys-color-success)] text-xs flex items-center gap-1.5">
                  <span>✓</span> Aturan yang Dianjurkan (Do&apos;s)
                </span>
                <ul className="space-y-1.5 text-[var(--md-sys-color-on-surface)] text-[11px]">
                  {currentTemplate.dosAndDonts.dos.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[var(--md-sys-color-success)] font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[var(--md-sys-color-error)]/30 bg-[var(--md-sys-color-error-container)]/30 p-4 space-y-2">
                <span className="font-bold text-[var(--md-sys-color-error)] text-xs flex items-center gap-1.5">
                  <span>✕</span> Hal yang Harus Dihindari (Don&apos;ts)
                </span>
                <ul className="space-y-1.5 text-[var(--md-sys-color-on-surface)] text-[11px]">
                  {currentTemplate.dosAndDonts.donts.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[var(--md-sys-color-error)] font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Section 4: Action Buttons ───────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--md-sys-color-border-subtle)]">
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={`/templates/${currentTemplate.id}_template.csv`}
                download={`${currentTemplate.id}_template.csv`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container)] px-4 py-2 text-xs font-semibold text-[var(--md-sys-color-on-surface)] transition-colors shadow-2xs"
              >
                <span>⬇</span>
                {t.downloadBlank}
              </a>
              <a
                href={`/templates/${currentTemplate.id}_sample.csv`}
                download={`${currentTemplate.id}_sample.csv`}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--md-sys-color-primary)]/30 bg-[var(--md-sys-color-primary-container)]/40 hover:bg-[var(--md-sys-color-primary-container)] px-4 py-2 text-xs font-semibold text-[var(--md-sys-color-primary)] transition-colors"
              >
                <span>📊</span>
                {t.downloadSample}
              </a>
            </div>

            <button
              onClick={() => handleLoadSampleDirectly(currentTemplate.id)}
              disabled={isLoadingSample}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--md-sys-color-primary)] hover:opacity-90 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoadingSample ? t.loadingSample : t.loadSampleDirectly}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
