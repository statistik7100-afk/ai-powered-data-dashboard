"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { parseCsvFile } from "@/utils/csvParser";
import { validateDatasetAgainstTemplate } from "@/utils/dataValidator";
import { ValidationReport, TableMetadata, UserColumnMeta } from "@/types/dataset-template";
import { DOMAIN_TEMPLATES } from "@/config/dataset-templates";

/* ── Types ─────────────────────────────────────────────────── */
export interface ChartRecommendation {
  type: "bar" | "line" | "pie";
  xAxisKey: string;
  yAxisKey: string;
  chartData?: Record<string, unknown>[];
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
  language: "en" | "id";
  theme: "light" | "dark";
  isMockMode: boolean;
  activeTemplateId: string;
  validationReport: ValidationReport | null;
  tableMetadata: TableMetadata | null;
  columnsMetadata: UserColumnMeta[] | null;
}

interface ProcessUserDatasetPayload {
  rawData: Record<string, unknown>[];
  columns: string[];
  tableMetadata: TableMetadata;
  columnsMetadata: UserColumnMeta[];
  dataFileName: string;
  fileSize: number;
}

interface DashboardContextValue extends DashboardState {
  processDataset: (file: File) => Promise<void>;
  processDatasetWithUserMetadata: (payload: ProcessUserDatasetPayload) => Promise<void>;
  setLanguage: (lang: "en" | "id") => void;
  setActiveTemplateId: (id: string) => void;
  reset: () => void;
  toggleMockMode: () => void;
  toggleTheme: () => void;
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
  language: "id", // Default to Indonesian as requested
  theme: "light", // Default to Google Material Light Theme
  isMockMode: true, // Default true untuk menghemat kuota selama styling UI
  activeTemplateId: "sales_revenue",
  validationReport: null,
  tableMetadata: null,
  columnsMetadata: null,
};

/* ── Context ────────────────────────────────────────────────── */
const DashboardContext = createContext<DashboardContextValue | null>(null);

/* ── Provider ───────────────────────────────────────────────── */
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>(initialState);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("app_theme") as "light" | "dark" | null;
      const initialTheme = savedTheme === "dark" ? "dark" : "light";
      if (initialTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
      
      const saved = sessionStorage.getItem("active_dashboard_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({ ...prev, ...parsed, theme: initialTheme, isAnalyzing: false }));
      } else {
        setState((prev) => ({ ...prev, theme: initialTheme }));
      }
    } catch (e) {
      console.warn("Gagal memulihkan session:", e);
    }
  }, []);

  useEffect(() => {
    if (state.aiReport && state.rawData.length > 0) {
      sessionStorage.setItem(
        "active_dashboard_state",
        JSON.stringify({
          rawData: state.rawData,
          columns: state.columns,
          fileName: state.fileName,
          fileSize: state.fileSize,
          aiReport: state.aiReport,
          language: state.language,
          activeTemplateId: state.activeTemplateId,
          validationReport: state.validationReport,
          tableMetadata: state.tableMetadata,
          columnsMetadata: state.columnsMetadata,
        })
      );
    }
  }, [
    state.aiReport,
    state.rawData,
    state.columns,
    state.fileName,
    state.fileSize,
    state.language,
    state.activeTemplateId,
    state.validationReport,
    state.tableMetadata,
    state.columnsMetadata,
  ]);

  const setActiveTemplateId = (id: string) => {
    setState((prev) => ({ ...prev, activeTemplateId: id }));
  };

  /* ── Process with User-Defined Metadata ─────────────────────── */
  const processDatasetWithUserMetadata = useCallback(
    async (payload: ProcessUserDatasetPayload) => {
      const { rawData, columns, tableMetadata, columnsMetadata, dataFileName, fileSize } = payload;

      setState((prev) => ({
        ...prev,
        isAnalyzing: true,
        error: null,
        aiReport: null,
        fileName: dataFileName,
        fileSize,
        rawData,
        columns,
        tableMetadata,
        columnsMetadata,
        validationReport: {
          isValid: true,
          healthScore: 100,
          matchedColumns: columns,
          missingRequiredColumns: [],
          extraColumns: [],
          issues: [],
        },
      }));

      try {
        const yKey = tableMetadata.primaryKpi || columns[1] || columns[0];
        const xKey =
          columnsMetadata.find((c) => c.role === "dimension" || c.role === "timestamp")?.columnName ||
          columns[0];

        // Hitung agregasi lokal
        const aggregatedMap = new Map<string, number>();
        for (const row of rawData) {
          const rawCat = String(row[xKey] ?? "Lainnya");
          const rawVal = typeof row[yKey] === "number" ? row[yKey] : Number(row[yKey]) || 0;
          aggregatedMap.set(rawCat, (aggregatedMap.get(rawCat) || 0) + rawVal);
        }

        const chartData = Array.from(aggregatedMap.entries())
          .slice(0, 10)
          .map(([cat, val]) => ({
            [xKey]: cat,
            [yKey]: val,
          }));

        const totalKpiValue = Array.from(aggregatedMap.values()).reduce((a, b) => a + b, 0);

        if (state.isMockMode) {
          const unitStr = tableMetadata.currencyOrUnit ? ` ${tableMetadata.currencyOrUnit}` : "";
          const mockReport: AiReport = {
            executiveSummary:
              state.language === "id"
                ? `Analisis terarah pada dataset "${tableMetadata.tableName || dataFileName}" selesai. Sesuai sasaran analisis Anda ("${tableMetadata.tableDescription}"), metrik utama "${yKey}" mencatatkan akumulasi total sebesar ${totalKpiValue.toLocaleString("id-ID")}${unitStr}. Pola distribusi tertinggi tercatat pada kategori "${chartData[0]?.[xKey] || "Utama"}". Seluruh interpretasi diselaraskan dengan kamus metadata yang telah Anda definisikan.`
                : `Targeted analysis on dataset "${tableMetadata.tableName || dataFileName}" completed. Aligned with your stated objective ("${tableMetadata.tableDescription}"), primary KPI "${yKey}" accumulated a total of ${totalKpiValue.toLocaleString()}${unitStr}. Leading category is "${chartData[0]?.[xKey] || "Primary"}". Insights are aligned with your custom metadata dictionary.`,
            chartRecommendation: {
              type: "bar",
              xAxisKey: xKey,
              yAxisKey: yKey,
              chartData: chartData.length > 0 ? chartData : rawData.slice(0, 10),
            },
          };

          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              isAnalyzing: false,
              aiReport: mockReport,
            }));
          }, 450);
          return;
        }

        // Live API Gemini Call
        let datasetPreview;
        if (rawData.length <= 150) {
          datasetPreview = rawData;
        } else {
          const step = Math.floor(rawData.length / 150);
          datasetPreview = rawData.filter((_, index) => index % step === 0).slice(0, 150);
        }

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            datasetPreview,
            columns,
            language: state.language,
            tableContext: tableMetadata,
            columnsMetadata,
          }),
        });

        if (!response.ok) {
          const errBody = await response.json();
          throw new Error(errBody.error || `API error: ${response.status}`);
        }

        const aiReport: AiReport = await response.json();
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          aiReport,
        }));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses data.";
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: message,
        }));
      }
    },
    [state.language, state.isMockMode]
  );

  /* ── Standard Preset Processing ─────────────────────────────── */
  const processDataset = useCallback(
    async (file: File) => {
      setState((prev) => ({
        ...prev,
        isAnalyzing: true,
        error: null,
        aiReport: null,
        fileName: file.name,
        fileSize: file.size,
      }));

      try {
        const parsedData = (await parseCsvFile(file)) as Record<string, unknown>[];

        if (parsedData.length === 0) {
          throw new Error("File CSV kosong atau tidak memiliki baris data yang valid.");
        }

        const columns = Object.keys(parsedData[0]);

        const validation = validateDatasetAgainstTemplate(
          columns,
          parsedData,
          state.activeTemplateId
        );

        setState((prev) => ({
          ...prev,
          rawData: parsedData,
          columns,
          validationReport: validation,
        }));

        if (state.isMockMode) {
          const matchedTmpl =
            DOMAIN_TEMPLATES.find((t) => t.id === validation.matchedTemplateId) || DOMAIN_TEMPLATES[0];

          const xKey =
            matchedTmpl.columns.find((c) => c.role === "dimension" || c.role === "timestamp")?.key ||
            columns[0] ||
            "kategori";
          const yKey = matchedTmpl.primaryKpi || columns[1] || columns[0] || "nilai";

          const aggregatedMap = new Map<string, number>();
          for (const row of parsedData) {
            const rawCat = String(row[xKey] ?? "Lainnya");
            const rawVal = typeof row[yKey] === "number" ? row[yKey] : Number(row[yKey]) || 0;
            aggregatedMap.set(rawCat, (aggregatedMap.get(rawCat) || 0) + rawVal);
          }

          const chartData = Array.from(aggregatedMap.entries())
            .slice(0, 8)
            .map(([cat, val]) => ({
              [xKey]: cat,
              [yKey]: val,
            }));

          const totalKpiValue = Array.from(aggregatedMap.values()).reduce((a, b) => a + b, 0);

          const dynamicMockReport: AiReport = {
            executiveSummary:
              state.language === "id"
                ? `Analisis terarah pada dataset "${file.name}" (Domain: ${matchedTmpl.title}) berhasil diproses. Berdasarkan validasi acuan standar (Skor Kesehatan Data: ${validation.healthScore}%), metrik utama "${yKey}" membukukan akumulasi total sebesar ${totalKpiValue.toLocaleString("id-ID")} ${matchedTmpl.currency || ""}. Kategori "${chartData[0]?.[xKey] || "Utama"}" menjadi kontributor dominan.`
                : `Targeted analysis on dataset "${file.name}" (${matchedTmpl.title}) has completed. Based on standard reference validation (Health Score: ${validation.healthScore}%), primary metric "${yKey}" reached an aggregate total of ${totalKpiValue.toLocaleString()} ${matchedTmpl.currency || ""}.`,
            chartRecommendation: {
              type: "bar",
              xAxisKey: xKey,
              yAxisKey: yKey,
              chartData: chartData.length > 0 ? chartData : parsedData.slice(0, 8),
            },
          };

          setTimeout(() => {
            setState((prev) => ({
              ...prev,
              isAnalyzing: false,
              aiReport: dynamicMockReport,
            }));
          }, 400);
          return;
        }

        let datasetPreview;
        if (parsedData.length <= 150) {
          datasetPreview = parsedData;
        } else {
          const step = Math.floor(parsedData.length / 150);
          datasetPreview = parsedData.filter((_, index) => index % step === 0).slice(0, 150);
        }

        const cacheKey = `ai_report_${file.name}_${file.size}_${state.language}_${state.activeTemplateId}`;
        const cachedReport = sessionStorage.getItem(cacheKey);

        if (cachedReport) {
          setState((prev) => ({
            ...prev,
            isAnalyzing: false,
            aiReport: JSON.parse(cachedReport),
          }));
          return;
        }

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            datasetPreview,
            columns,
            language: state.language,
            templateId: validation.matchedTemplateId,
          }),
        });

        if (!response.ok) {
          const errBody = await response.json();
          throw new Error(errBody.error || `API error: ${response.status}`);
        }

        const aiReport: AiReport = await response.json();
        sessionStorage.setItem(cacheKey, JSON.stringify(aiReport));

        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          aiReport,
        }));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Terjadi kesalahan saat memproses data.";
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          error: message,
        }));
      }
    },
    [state.language, state.isMockMode, state.activeTemplateId]
  );

  const reset = useCallback(() => {
    sessionStorage.removeItem("active_dashboard_state");
    setState((prev) => ({ ...initialState, isMockMode: prev.isMockMode }));
  }, []);

  const toggleMockMode = () =>
    setState((prev) => ({ ...prev, isMockMode: !prev.isMockMode }));

  const setLanguage = (language: "en" | "id") => {
    setState((prev) => ({ ...prev, language }));
  };

  const toggleTheme = () => {
    setState((prev) => {
      const nextTheme = prev.theme === "light" ? "dark" : "light";
      try {
        localStorage.setItem("app_theme", nextTheme);
      } catch {}
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.setAttribute("data-theme", "light");
      }
      return { ...prev, theme: nextTheme };
    });
  };

  return (
    <DashboardContext.Provider
      value={{
        ...state,
        processDataset,
        processDatasetWithUserMetadata,
        reset,
        setLanguage,
        setActiveTemplateId,
        toggleMockMode,
        toggleTheme,
      }}
    >
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
