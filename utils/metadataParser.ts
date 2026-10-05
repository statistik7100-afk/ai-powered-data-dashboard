import Papa from "papaparse";
import { UserColumnMeta, DataType, ColumnRole } from "@/types/dataset-template";

export function parseMetadataCsvFile(file: File): Promise<UserColumnMeta[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawRows = results.data as Record<string, string>[];
          if (!rawRows || rawRows.length === 0) {
            throw new Error("File metadata kosong atau tidak memiliki baris data.");
          }

          const parsedList: UserColumnMeta[] = rawRows.map((row, idx) => {
            // Case-insensitive lookup untuk nama kolom
            const getVal = (possibleKeys: string[]): string => {
              for (const pk of possibleKeys) {
                const foundKey = Object.keys(row).find((k) => k.trim().toLowerCase() === pk.toLowerCase());
                if (foundKey && row[foundKey] !== undefined) {
                  return String(row[foundKey]).trim();
                }
              }
              return "";
            };

            const colName = getVal(["column_name", "kolom", "name", "nama_kolom"]);
            if (!colName) {
              throw new Error(`Baris ke-${idx + 1} di metadata tidak memiliki nilai 'column_name'.`);
            }

            const rawType = getVal(["data_type", "type", "tipe"]).toLowerCase();
            let dataType: DataType = "string";
            if (rawType.includes("num") || rawType.includes("angka") || rawType.includes("int") || rawType.includes("float")) {
              dataType = "number";
            } else if (rawType.includes("date") || rawType.includes("tgl") || rawType.includes("waktu")) {
              dataType = "date";
            } else if (rawType.includes("bool")) {
              dataType = "boolean";
            }

            const rawRole = getVal(["role", "peran"]).toLowerCase();
            let role: ColumnRole = "dimension";
            if (rawRole.includes("metric") || rawRole.includes("metrik") || rawRole.includes("measure")) {
              role = "metric";
            } else if (rawRole.includes("time") || rawRole.includes("waktu") || rawRole.includes("date")) {
              role = "timestamp";
            } else if (rawRole.includes("id") || rawRole.includes("kode") || rawRole.includes("identifier")) {
              role = "identifier";
            }

            return {
              columnName: colName,
              displayName: getVal(["display_name", "label", "judul"]) || colName,
              dataType,
              role,
              unit: getVal(["unit", "satuan"]) || undefined,
              description: getVal(["description", "deskripsi", "penjelasan"]) || `Kolom ${colName}`,
            };
          });

          resolve(parsedList);
        } catch (err) {
          reject(err);
        }
      },
      error: (error: Error) => reject(error),
    });
  });
}

export function inferInitialColumnsMetadata(
  columns: string[],
  sampleRows: Record<string, unknown>[]
): UserColumnMeta[] {
  return columns.map((col) => {
    const lower = col.toLowerCase();
    let dataType: DataType = "string";
    let role: ColumnRole = "dimension";
    let unit: string | undefined = undefined;

    // Cek sampel nilai untuk tebak tipe
    let hasNumbers = 0;
    let hasDates = 0;
    const testLimit = Math.min(sampleRows.length, 10);

    for (let i = 0; i < testLimit; i++) {
      const val = sampleRows[i]?.[col];
      if (typeof val === "number") hasNumbers++;
      if (typeof val === "string" && !isNaN(Number(val)) && val.trim() !== "") hasNumbers++;
      if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) hasDates++;
    }

    if (hasDates > testLimit * 0.5 || lower.includes("date") || lower.includes("tgl") || lower.includes("tanggal")) {
      dataType = "date";
      role = "timestamp";
      unit = "YYYY-MM-DD";
    } else if (hasNumbers > testLimit * 0.5) {
      dataType = "number";
      role = "metric";
      if (lower.includes("price") || lower.includes("biaya") || lower.includes("revenue") || lower.includes("gaji") || lower.includes("omzet") || lower.includes("uang")) {
        unit = "IDR";
      } else if (lower.includes("persen") || lower.includes("percent") || lower.includes("ratio") || lower.includes("rate")) {
        unit = "%";
      } else {
        unit = "unit";
      }
    } else if (lower.includes("id") || lower.includes("sku") || lower.includes("code") || lower.includes("kode")) {
      dataType = "string";
      role = "identifier";
    }

    // Buat display name ramah
    const displayName = col
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return {
      columnName: col,
      displayName,
      dataType,
      role,
      unit,
      description: `Data ${displayName} untuk analisis`,
    };
  });
}

export function generateMetadataCsvString(columns: UserColumnMeta[]): string {
  const headers = ["column_name", "display_name", "data_type", "role", "unit", "description"];
  const rows = columns.map((c) => [
    `"${c.columnName.replace(/"/g, '""')}"`,
    `"${c.displayName.replace(/"/g, '""')}"`,
    c.dataType,
    c.role,
    `"${(c.unit || "").replace(/"/g, '""')}"`,
    `"${c.description.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function triggerDownloadMetadataCsv(columns: UserColumnMeta[], fileName = "metadata.csv"): void {
  const csvContent = generateMetadataCsvString(columns);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
