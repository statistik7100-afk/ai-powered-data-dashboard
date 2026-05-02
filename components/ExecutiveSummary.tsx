"use client";

import React from "react";

interface ExecutiveSummaryProps {
  summary: string;
  isAnalyzing: boolean;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary, isAnalyzing }) => {
  // If no summary and not analyzing, don't render content but keep the shell? 
  // Actually, the parent handles the shell. This component handles the content.

  if (isAnalyzing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Generating Report...
          </p>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded-md bg-white/5" />
          <div className="h-4 w-[90%] animate-pulse rounded-md bg-white/5" />
          <div className="h-4 w-[95%] animate-pulse rounded-md bg-white/5" />
          <div className="h-4 w-[85%] animate-pulse rounded-md bg-white/5" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  // Split summary into paragraphs if it's long
  const paragraphs = summary.split("\n\n").filter(p => p.trim() !== "");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/10 text-[10px] text-teal-400">
          ✦
        </span>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          AI Analysis Insight
        </h3>
      </div>
      
      <div className="space-y-4">
        {paragraphs.map((para, idx) => (
          <p 
            key={idx} 
            className="text-sm leading-relaxed text-slate-300 first-letter:text-lg first-letter:font-semibold first-letter:text-indigo-400"
          >
            {para}
          </p>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {["Enterprise Ready", "Data Driven", "AI Verified"].map((tag) => (
          <span 
            key={tag} 
            className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 text-[9px] font-medium text-slate-500"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveSummary;
