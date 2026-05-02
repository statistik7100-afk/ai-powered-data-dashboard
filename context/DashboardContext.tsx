"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import { parseCsvFile } from "@/utils/csvParser";

/* ── Types ─────────────────────────────────────────────────── */
export interface ChartRecommendation {
  type: "bar" | "line" | "pie";
  xAxisKey: string;
  yAxisKey: string;
}

export interface AiReport {
  executiveSummary: string;
  chartRecommendation: ChartRecommendation;
}

interface DashboardState {
  rawData: Record<string, unknown>[];
  columns: string[];
  fileName: string | null;
  fileSize: number | null;
  isAnalyzing: boolean;
  aiReport: AiReport | null;
  error: string | null;
}

interface DashboardContextValue extends DashboardState {
  processDataset: (file: File) => Promise<void>;
  reset: () => void;
}

/* ── Initial State ──────────────────────────────────────────── */
const initialState: DashboardState = {
  rawData: [],
  columns: [],
  fileName: null,
  fileSize: null,
  isAnalyzing: false,
  aiReport: null,
  error: null,
};

/* ── Context ────────────────────────────────────────────────── */
const DashboardContext = createContext<DashboardContextValue | null>(null);

/* ── Provider ───────────────────────────────────────────────── */
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>(initialState);

  const processDataset = useCallback(async (file: File) => {
    // 1. Reset error, set loading state
    setState((prev) => ({
      ...prev,
      isAnalyzing: true,
      error: null,
      aiReport: null,
      fileName: file.name,
      fileSize: file.size,
    }));

    try {
      // 2. Parse CSV in the browser using PapaParse (from TSK-03)
      const parsedData = await parseCsvFile(file) as Record<string, unknown>[];

      if (parsedData.length === 0) {
        throw new Error("The CSV file is empty or has no valid rows.");
      }

      // 3. Extract column names from the first row
      const columns = Object.keys(parsedData[0]);

      // 4. Store raw data in state
      setState((prev) => ({ ...prev, rawData: parsedData, columns }));

      // 5. Build a compact preview payload — max 8 rows, to keep OpenAI token cost low
      const datasetPreview = parsedData.slice(0, 8);

      // 6. Call the secure Next.js API proxy (from TSK-04)
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetPreview, columns }),
      });

      if (!response.ok) {
        const errBody = await response.json();
        throw new Error(errBody.error || `API error: ${response.status}`);
      }

      const aiReport: AiReport = await response.json();

      // 7. Store the final AI report
      setState((prev) => ({
        ...prev,
        isAnalyzing: false,
        aiReport,
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setState((prev) => ({
        ...prev,
        isAnalyzing: false,
        error: message,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <DashboardContext.Provider value={{ ...state, processDataset, reset }}>
      {children}
    </DashboardContext.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────── */
export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used inside <DashboardProvider>");
  }
  return ctx;
}
