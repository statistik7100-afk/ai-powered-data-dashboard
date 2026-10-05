import { DomainTemplate, ValidationReport, ValidationIssue } from "@/types/dataset-template";
import { DOMAIN_TEMPLATES } from "@/config/dataset-templates";

export function validateDatasetAgainstTemplate(
  columns: string[],
  rows: Record<string, unknown>[],
  selectedTemplateId?: string
): ValidationReport {
  // 1. Tentukan template acuan: jika tidak ditentukan, coba cari template yang paling cocok (best match)
  let targetTemplate: DomainTemplate | undefined = DOMAIN_TEMPLATES.find(
    (t) => t.id === selectedTemplateId
  );

  if (!targetTemplate && columns.length > 0) {
    // Auto-detect template berdasarkan kolom yang paling banyak cocok
    let maxMatch = 0;
    for (const t of DOMAIN_TEMPLATES) {
      const matchCount = t.columns.filter((c) =>
        columns.some((col) => col.trim().toLowerCase() === c.key.toLowerCase())
      ).length;
      if (matchCount > maxMatch) {
        maxMatch = matchCount;
        targetTemplate = t;
      }
    }
  }

  // Jika tetap tidak ada template atau data kosong sama sekali
  if (rows.length === 0 || columns.length === 0) {
    return {
      isValid: false,
      healthScore: 0,
      matchedColumns: [],
      missingRequiredColumns: targetTemplate ? targetTemplate.columns.filter((c) => c.required).map((c) => c.key) : [],
      extraColumns: [],
      issues: [
        {
          type: "error",
          code: "EMPTY_DATASET",
          message: "File CSV tidak memiliki baris data atau kolom yang terbaca.",
        },
      ],
    };
  }

  const normalizedColumns = columns.map((c) => c.trim().toLowerCase());
  const issues: ValidationIssue[] = [];
  const matchedColumns: string[] = [];
  const missingRequiredColumns: string[] = [];
  const extraColumns: string[] = [];

  // Jika ada template acuan
  if (targetTemplate) {
    for (const colDef of targetTemplate.columns) {
      const foundInUploaded = normalizedColumns.includes(colDef.key.toLowerCase());
      if (foundInUploaded) {
        matchedColumns.push(colDef.key);
      } else if (colDef.required) {
        missingRequiredColumns.push(colDef.key);
        issues.push({
          type: "error",
          code: "MISSING_REQUIRED_COLUMN",
          column: colDef.key,
          message: `Kolom wajib "${colDef.key}" (${colDef.label}) tidak ditemukan dalam file CSV Anda.`,
        });
      }
    }

    // Kolom ekstra yang tidak ada di acuan
    for (const col of columns) {
      const isKnown = targetTemplate.columns.some((c) => c.key.toLowerCase() === col.trim().toLowerCase());
      if (!isKnown) {
        extraColumns.push(col);
      }
    }

    // 2. Sample data type check (periksa 25 baris pertama)
    const sampleRows = rows.slice(0, 25);
    for (const colDef of targetTemplate.columns) {
      const actualColName = columns.find((c) => c.trim().toLowerCase() === colDef.key.toLowerCase());
      if (!actualColName) continue;

      let dirtyNumberCount = 0;
      let nullCount = 0;

      for (let i = 0; i < sampleRows.length; i++) {
        const val = sampleRows[i][actualColName];
        if (val === null || val === undefined || val === "") {
          nullCount++;
          continue;
        }

        if (colDef.type === "number") {
          // Periksa apakah tercemar simbol mata uang atau titik ribuan
          if (typeof val === "string") {
            const hasCurrencySymbol = /[Rp$€¥]/.test(val);
            const isUnclean = /[^0-9.-]/.test(val.replace(/,/g, ""));
            if (hasCurrencySymbol || isUnclean) {
              dirtyNumberCount++;
            }
          }
        }
      }

      if (dirtyNumberCount > 0) {
        issues.push({
          type: "warning",
          code: "FORMAT_VIOLATION",
          column: colDef.key,
          message: `Kolom "${colDef.key}" memuat simbol teks atau tanda mata uang pada beberapa baris. Sistem menyarankan angka numerik murni.`,
        });
      }

      if (nullCount / sampleRows.length > 0.4) {
        issues.push({
          type: "warning",
          code: "HIGH_NULL_RATIO",
          column: colDef.key,
          message: `Kolom "${colDef.key}" memiliki lebih dari 40% nilai kosong (kosong/null).`,
        });
      }
    }
  }

  // 3. Kalkulasi Health Score (0 - 100%)
  let healthScore = 100;
  if (missingRequiredColumns.length > 0) {
    healthScore -= missingRequiredColumns.length * 25;
  }
  for (const issue of issues) {
    if (issue.type === "error") healthScore -= 20;
    if (issue.type === "warning") healthScore -= 10;
  }
  healthScore = Math.max(0, Math.min(100, healthScore));

  const isValid = missingRequiredColumns.length === 0 && issues.filter((i) => i.type === "error").length === 0;

  return {
    isValid,
    healthScore,
    matchedTemplateId: targetTemplate?.id,
    matchedColumns,
    missingRequiredColumns,
    extraColumns,
    issues,
  };
}
