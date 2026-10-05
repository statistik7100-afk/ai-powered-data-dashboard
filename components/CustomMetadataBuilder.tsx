"use client";

import { useState, useRef, ChangeEvent } from "react";
import { UserColumnMeta, TableMetadata } from "@/types/dataset-template";
import {
  parseMetadataCsvFile,
  inferInitialColumnsMetadata,
  triggerDownloadMetadataCsv,
} from "@/utils/metadataParser";
import { parseCsvFile } from "@/utils/csvParser";

interface CustomMetadataBuilderProps {
  onDatasetReady: (payload: {
    rawData: Record<string, unknown>[];
    columns: string[];
    tableMetadata: TableMetadata;
    columnsMetadata: UserColumnMeta[];
    dataFileName: string;
    fileSize: number;
  }) => void;
  isProcessing?: boolean;
}

export default function CustomMetadataBuilder({
  onDatasetReady,
  isProcessing = false,
}: CustomMetadataBuilderProps) {
  // File states
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [dataRows, setDataRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  // Metadata form states
  const [tableName, setTableName] = useState<string>("");
  const [tableDescription, setTableDescription] = useState<string>("");
  const [primaryKpi, setPrimaryKpi] = useState<string>("");
  const [columnsMetadata, setColumnsMetadata] = useState<UserColumnMeta[]>([]);
  const [isEditingMetadata, setIsEditingMetadata] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dataInputRef = useRef<HTMLInputElement>(null);
  const metaInputRef = useRef<HTMLInputElement>(null);

  // ── Handle Data File ──────────────────────────────────────────
  const handleDataFileChange = async (file: File) => {
    setErrorMsg(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMsg("File data utama harus berekstensi .csv");
      return;
    }

    try {
      const parsed = (await parseCsvFile(file)) as Record<string, unknown>[];
      if (parsed.length === 0) {
        throw new Error("File CSV tidak memiliki baris data yang terbaca.");
      }

      const extractedCols = Object.keys(parsed[0]);
      setDataFile(file);
      setDataRows(parsed);
      setColumns(extractedCols);

      // Set default table name from file name
      const defaultName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setTableName(defaultName.toUpperCase());

      // If user hasn't uploaded metadata file yet, infer initial metadata
      if (!metadataFile) {
        const inferred = inferInitialColumnsMetadata(extractedCols, parsed);
        setColumnsMetadata(inferred);

        // Auto select first metric as primary KPI
        const firstMetric = inferred.find((c) => c.role === "metric")?.columnName || extractedCols[1] || extractedCols[0];
        setPrimaryKpi(firstMetric);
      }

      setIsEditingMetadata(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membaca file data";
      setErrorMsg(msg);
    }
  };

  // ── Handle Metadata File ──────────────────────────────────────
  const handleMetadataFileChange = async (file: File) => {
    setErrorMsg(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMsg("File metadata harus berformat .csv");
      return;
    }

    try {
      const parsedMeta = await parseMetadataCsvFile(file);
      setMetadataFile(file);
      setColumnsMetadata(parsedMeta);

      const firstMetric = parsedMeta.find((c) => c.role === "metric")?.columnName || parsedMeta[0]?.columnName;
      if (firstMetric) setPrimaryKpi(firstMetric);

      setIsEditingMetadata(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membaca file metadata";
      setErrorMsg(msg);
    }
  };

  // ── Update Single Column Meta ─────────────────────────────────
  const handleColumnUpdate = (
    index: number,
    field: keyof UserColumnMeta,
    value: string
  ) => {
    setColumnsMetadata((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      // Auto synchronize primaryKpi if changed column was the primary KPI
      if (field === "role" && value !== "metric" && updated[index].columnName === primaryKpi) {
        const nextMetric = updated.find((c) => c.role === "metric")?.columnName || "";
        setPrimaryKpi(nextMetric);
      }
      return updated;
    });
  };

  // ── Submit / Trigger AI Analysis ──────────────────────────────
  const handleSubmit = () => {
    setErrorMsg(null);
    if (!dataFile || dataRows.length === 0) {
      setErrorMsg("Harap unggah file CSV data terlebih dahulu.");
      return;
    }

    if (!tableDescription.trim()) {
      setErrorMsg("Harap isi penjelasan singkat tabel agar AI dapat memahami konteks bisnis data Anda.");
      return;
    }

    const effectiveKpi = primaryKpi || columnsMetadata.find((c) => c.role === "metric")?.columnName || columns[0];

    const tableMetadata: TableMetadata = {
      tableName: tableName || dataFile.name,
      tableDescription: tableDescription.trim(),
      primaryKpi: effectiveKpi,
      currencyOrUnit: columnsMetadata.find((c) => c.columnName === effectiveKpi)?.unit || undefined,
    };

    onDatasetReady({
      rawData: dataRows,
      columns,
      tableMetadata,
      columnsMetadata,
      dataFileName: dataFile.name,
      fileSize: dataFile.size,
    });
  };

  return (
    <div className="m3-card-elevated w-full max-w-4xl mx-auto p-6 sm:p-8 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--md-sys-color-border-subtle)] pb-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
            <span>⚙️</span> Mode Fleksibel: Tentukan Metadata & Konteks Data
          </h3>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Unggah dataset apa pun dan tentukan penjelasan tabel serta arti kolom agar AI memahami konteks bisnis Anda dengan sempurna.
          </p>
        </div>
        <span className="rounded-full bg-[var(--md-sys-color-primary-container)] px-3 py-1 text-[11px] font-semibold text-[var(--md-sys-color-on-primary-container)]">
          User-Defined Metadata
        </span>
      </div>

      {/* ── Dual Upload Zone (M3 Outlined Boxes) ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Box 1: File Data Utama */}
        <div
          onClick={() => dataInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            dataFile
              ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/25"
              : "border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)]"
          }`}
        >
          <input
            ref={dataInputRef}
            type="file"
            accept=".csv"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.files?.[0]) handleDataFileChange(e.target.files[0]);
            }}
            className="hidden"
          />
          <span className="text-3xl mb-2">{dataFile ? "✅" : "📄"}</span>
          <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] text-center">
            {dataFile ? dataFile.name : "1. Unggah File Data Utama (.CSV)"}
          </span>
          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1 text-center">
            {dataFile
              ? `${dataRows.length} baris, ${columns.length} kolom terdeteksi`
              : "Klik atau seret file CSV data aktual Anda di sini"}
          </span>
        </div>

        {/* Box 2: File Metadata Pendamping (Opsional) */}
        <div
          onClick={() => metaInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
            metadataFile
              ? "border-[var(--md-sys-color-success)] bg-[var(--md-sys-color-success-container)]/25"
              : "border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)]"
          }`}
        >
          <input
            ref={metaInputRef}
            type="file"
            accept=".csv"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              if (e.target.files?.[0]) handleMetadataFileChange(e.target.files[0]);
            }}
            className="hidden"
          />
          <span className="text-3xl mb-2">{metadataFile ? "📋" : "📑"}</span>
          <span className="text-xs font-semibold text-[var(--md-sys-color-on-surface)] text-center">
            {metadataFile ? metadataFile.name : "2. Unggah File metadata.csv (Opsional)"}
          </span>
          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] mt-1 text-center">
            {metadataFile
              ? "Kamus metadata berhasil terbaca"
              : "Jika punya file kamus kolom, atau isi form di bawah"}
          </span>
        </div>
      </div>

      {/* ── Error Banner ────────────────────────────────────────── */}
      {errorMsg && (
        <div className="mb-6 rounded-2xl border border-[var(--md-sys-color-error)]/30 bg-[var(--md-sys-color-error-container)] p-3.5 text-xs text-[var(--md-sys-color-on-error-container)] flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Interactive In-App Metadata Builder ─────────────────── */}
      {isEditingMetadata && (
        <div className="space-y-6 pt-2 border-t border-[var(--md-sys-color-border-subtle)] animate-in fade-in duration-300">
          {/* Section A: Konteks Tabel */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)] flex items-center gap-2">
              <span>✍️</span> Langkah 1: Penjelasan Konteks & Sasaran Tabel
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1.5">
                  Nama / Judul Tabel
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Contoh: Rekam Medis Pasien RS Harapan"
                  className="w-full rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3.5 py-2 text-xs text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1.5">
                  Metrik Utama (Primary KPI) yang Ingin Disorot
                </label>
                <select
                  value={primaryKpi}
                  onChange={(e) => setPrimaryKpi(e.target.value)}
                  className="w-full rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3.5 py-2 text-xs text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/20"
                >
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col} {columnsMetadata.find((c) => c.columnName === col)?.role === "metric" ? "(Metrik Angka)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--md-sys-color-on-surface)] mb-1.5 flex items-center justify-between">
                <span>Penjelasan Singkat: Tabel ini tentang apa & apa sasaran analisis Anda? *</span>
                <span className="text-[11px] text-[var(--md-sys-color-primary)] font-medium">Penting untuk panduan AI</span>
              </label>
              <textarea
                rows={2}
                value={tableDescription}
                onChange={(e) => setTableDescription(e.target.value)}
                placeholder="Contoh: Tabel ini mencatat riwayat pasien rawat inap bulanan. Kami ingin menganalisis rata-rata lama rawat inap serta biaya tagihan medis berdasarkan departemen poli untuk evaluasi kapasitas bed."
                className="w-full rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] p-3 text-xs text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/20 leading-relaxed"
              />
            </div>
          </div>

          {/* Section B: Kamus Kolom Interaktif */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)] flex items-center gap-2">
                <span>📚</span> Langkah 2: Kamus Kolom & Arti Data (Dapat Anda Sesuaikan)
              </h4>
              <button
                type="button"
                onClick={() => triggerDownloadMetadataCsv(columnsMetadata, `${dataFile?.name.replace(".csv", "") || "dataset"}_metadata.csv`)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--md-sys-color-success)]/40 bg-[var(--md-sys-color-success-container)] px-3 py-1 text-[11px] font-semibold text-[var(--md-sys-color-on-success-container)] hover:opacity-90 transition-colors shadow-2xs"
                title="Unduh file kamus data ini agar bisa dipakai langsung di masa mendatang"
              >
                <span>⬇</span> Unduh metadata.csv ini
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--md-sys-color-border-subtle)] bg-[var(--md-sys-color-surface)] shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--md-sys-color-border-subtle)] bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)]">
                    <th className="py-2.5 px-3 font-semibold">Nama Kolom Asli</th>
                    <th className="py-2.5 px-3 font-semibold">Label Tampilan</th>
                    <th className="py-2.5 px-3 font-semibold">Peran Analisis</th>
                    <th className="py-2.5 px-3 font-semibold">Satuan (Unit)</th>
                    <th className="py-2.5 px-3 font-semibold">Penjelasan untuk AI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--md-sys-color-border-subtle)]">
                  {columnsMetadata.map((col, idx) => (
                    <tr key={col.columnName} className="hover:bg-[var(--md-sys-color-surface-container-low)]">
                      <td className="py-2 px-3 font-mono text-[11px] text-[var(--md-sys-color-on-surface)] whitespace-nowrap">
                        {col.columnName}
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={col.displayName}
                          onChange={(e) => handleColumnUpdate(idx, "displayName", e.target.value)}
                          className="w-32 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-2.5 py-1 text-[11px] text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] focus:outline-none"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <select
                          value={col.role}
                          onChange={(e) => handleColumnUpdate(idx, "role", e.target.value)}
                          className="rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-2.5 py-1 text-[11px] text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] focus:outline-none"
                        >
                          <option value="dimension">Dimensi (Kategori)</option>
                          <option value="metric">Metrik (Angka)</option>
                          <option value="timestamp">Waktu (Tanggal)</option>
                          <option value="identifier">ID / Kode Unik</option>
                        </select>
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={col.unit || ""}
                          placeholder="e.g. IDR, kg, %"
                          onChange={(e) => handleColumnUpdate(idx, "unit", e.target.value)}
                          className="w-20 rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-2.5 py-1 text-[11px] text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] focus:outline-none"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={col.description}
                          placeholder="Arti kolom ini..."
                          onChange={(e) => handleColumnUpdate(idx, "description", e.target.value)}
                          className="w-full min-w-[200px] rounded-lg border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-2.5 py-1 text-[11px] text-[var(--md-sys-color-on-surface)] focus:border-[var(--md-sys-color-primary)] focus:outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section C: Tombol Aksi */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--md-sys-color-border-subtle)]">
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              💡 Konteks dan kamus ini akan menjadi panduan eksklusif bagi Gemini saat mengurai narasi eksekutif.
            </span>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--md-sys-color-primary)] hover:opacity-90 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <span>🚀</span>
              <span>{isProcessing ? "Sedang Menganalisis..." : "Mulai Analisis AI dengan Konteks Ini"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
