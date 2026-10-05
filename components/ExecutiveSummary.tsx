"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";

interface ExecutiveSummaryProps {
  summary: string;
  isAnalyzing: boolean;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary, isAnalyzing }) => {
  const { language } = useDashboard();
  
  const t = {
    id: {
      generating: "Membuat Laporan Eksekutif...",
      insight: "Analisis Insight AI",
      tags: ["Siap Presentasi", "Berbasis Data", "Terverifikasi Gemini AI"]
    },
    en: {
      generating: "Generating Executive Report...",
      insight: "AI Analysis Insight",
      tags: ["Board Ready", "Data Driven", "Gemini AI Verified"]
    }
  }[language];

  if (isAnalyzing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--md-sys-color-primary)]" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
            {t.generating}
          </p>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded-lg bg-[var(--md-sys-color-surface-container-high)]" />
          <div className="h-4 w-[92%] animate-pulse rounded-lg bg-[var(--md-sys-color-surface-container-high)]" />
          <div className="h-4 w-[96%] animate-pulse rounded-lg bg-[var(--md-sys-color-surface-container-high)]" />
          <div className="h-4 w-[85%] animate-pulse rounded-lg bg-[var(--md-sys-color-surface-container-high)]" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  // Split summary into paragraphs
  const paragraphs = summary.split("\n\n").filter(p => p.trim() !== "");

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--md-sys-color-primary-container)] text-xs text-[var(--md-sys-color-primary)] shadow-2xs">
          ✦
        </span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
          {t.insight}
        </h3>
      </div>
      
      <div className="space-y-4">
        {paragraphs.map((para, idx) => (
          <p 
            key={idx} 
            className="text-sm leading-relaxed text-[var(--md-sys-color-on-surface)] first-letter:text-lg first-letter:font-bold first-letter:text-[var(--md-sys-color-primary)]"
          >
            {para}
          </p>
        ))}
      </div>

      <div className="pt-4 border-t border-[var(--md-sys-color-border-subtle)] flex flex-wrap gap-2">
        {t.tags.map((tag) => (
          <span 
            key={tag} 
            className="rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] px-3 py-1 text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveSummary;
