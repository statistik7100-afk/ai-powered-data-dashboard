"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { useDashboard } from "@/context/DashboardContext";

interface CsvUploaderProps {
  onFileAccepted: (file: File) => void;
}

export default function CsvUploader({ onFileAccepted }: CsvUploaderProps) {
  const { language } = useDashboard();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const t = {
    id: {
      invalidFile: "Tipe file tidak valid. Harap unggah file .csv saja.",
      release: "Lepaskan untuk mengunggah",
      dragDrop: "Seret & lepas file CSV Anda di sini",
      or: "atau",
      browse: "pilih file dari perangkat",
      limit: "Format .csv saja, hingga 50MB",
      badges: ["Format CSV", "Encoding UTF-8", "Maks 50MB"]
    },
    en: {
      invalidFile: "Invalid file type. Please upload a .csv file only.",
      release: "Release to upload",
      dragDrop: "Drag & drop your CSV file here",
      or: "or",
      browse: "browse from device",
      limit: ".csv files only, up to 50MB",
      badges: ["CSV Format", "UTF-8 Encoding", "Up to 50MB"]
    }
  }[language];

  const validateAndAccept = useCallback(
    (file: File) => {
      setError(null);
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError(t.invalidFile);
        return;
      }
      onFileAccepted(file);
    },
    [onFileAccepted, t.invalidFile]
  );

  /* ── Drag Handlers ─────────────────────────────────────────── */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndAccept(files[0]);
    }
  };

  /* ── Manual Input Handler ───────────────────────────────────── */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndAccept(files[0]);
    }
    // Reset so same file can be re-uploaded
    e.target.value = "";
  };

  const openFilePicker = () => inputRef.current?.click();

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drop Zone (M3 Outlined / Filled Container) */}
      <div
        id="csv-dropzone"
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file by drag and drop or click to browse"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        onKeyDown={(e) => e.key === "Enter" && openFilePicker()}
        className={[
          "relative flex flex-col items-center justify-center gap-4",
          "rounded-3xl border-2 border-dashed px-8 py-12 sm:py-16",
          "cursor-pointer select-none outline-none",
          "transition-all duration-200",
          isDragging
            ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/30 scale-[1.01] shadow-md"
            : "border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] hover:border-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)]",
        ].join(" ")}
      >
        {/* Animated Icon Container (M3 Tonal Circle) */}
        <div
          className={[
            "flex h-16 w-16 items-center justify-center rounded-2xl",
            "transition-all duration-200",
            isDragging
              ? "bg-[var(--md-sys-color-primary)] text-white scale-110 shadow-sm"
              : "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)]",
          ].join(" ")}
        >
          {isDragging ? (
            /* Hovering bounce icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-8 w-8 animate-bounce"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            /* Google Material style file upload icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          )}
        </div>

        {/* Text */}
        <div className="text-center px-4">
          <p className="text-base font-semibold text-[var(--md-sys-color-on-surface)]">
            {isDragging ? t.release : t.dragDrop}
          </p>
          <p className="mt-1 text-xs text-[var(--md-sys-color-on-surface-variant)]">
            {t.or}{" "}
            <span className="font-semibold text-[var(--md-sys-color-primary)] underline underline-offset-4">
              {t.browse}
            </span>{" "}
            &mdash; {t.limit}
          </p>
        </div>

        {/* M3 Assist Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {t.badges.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3 py-1 text-[11px] font-medium text-[var(--md-sys-color-on-surface-variant)] shadow-2xs"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id="csv-file-input"
        type="file"
        accept=".csv"
        onChange={handleInputChange}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Error Message (M3 Error Alert) */}
      {error && (
        <div
          id="csv-upload-error"
          role="alert"
          className="mt-4 flex items-center gap-3 rounded-2xl border border-[var(--md-sys-color-error)]/30 bg-[var(--md-sys-color-error-container)] px-5 py-3 text-xs text-[var(--md-sys-color-on-error-container)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 flex-shrink-0 text-[var(--md-sys-color-error)]"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
