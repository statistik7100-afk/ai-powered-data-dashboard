"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";

interface CsvUploaderProps {
  onFileAccepted: (file: File) => void;
}

export default function CsvUploader({ onFileAccepted }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndAccept = useCallback(
    (file: File) => {
      setError(null);
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Invalid file type. Please upload a .csv file only.");
        return;
      }
      onFileAccepted(file);
    },
    [onFileAccepted]
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
      {/* Drop Zone */}
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
          "rounded-2xl border-2 border-dashed px-8 py-14",
          "cursor-pointer select-none outline-none",
          "transition-all duration-200",
          isDragging
            ? "border-indigo-500 bg-indigo-500/10 scale-[1.01] shadow-lg shadow-indigo-500/10"
            : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
        ].join(" ")}
      >
        {/* Animated Icon */}
        <div
          className={[
            "flex h-16 w-16 items-center justify-center rounded-2xl",
            "border transition-all duration-200",
            isDragging
              ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-400"
              : "border-white/10 bg-white/5 text-slate-500",
          ].join(" ")}
        >
          {isDragging ? (
            /* Hovering icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7 animate-bounce"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            /* Default icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-7 w-7"
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
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-200">
            {isDragging ? "Release to upload" : "Drag & drop your CSV here"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            or{" "}
            <span className="text-indigo-400 underline underline-offset-2">
              click to browse
            </span>{" "}
            — .csv files only, up to 50MB
          </p>
        </div>

        {/* Badge row */}
        <div className="flex items-center gap-3 text-xs text-slate-600">
          {["CSV", "UTF-8", "Up to 50MB"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/8 bg-white/5 px-2.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Subtle corner accents */}
        <span className="absolute left-3 top-3 h-4 w-4 rounded-tl-md border-l-2 border-t-2 border-indigo-500/30" />
        <span className="absolute right-3 top-3 h-4 w-4 rounded-tr-md border-r-2 border-t-2 border-indigo-500/30" />
        <span className="absolute bottom-3 left-3 h-4 w-4 rounded-bl-md border-b-2 border-l-2 border-indigo-500/30" />
        <span className="absolute bottom-3 right-3 h-4 w-4 rounded-br-md border-b-2 border-r-2 border-indigo-500/30" />
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

      {/* Error Message */}
      {error && (
        <div
          id="csv-upload-error"
          role="alert"
          className="mt-3 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs text-red-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 flex-shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
