export type DataType = "string" | "number" | "date" | "boolean";
export type ColumnRole = "identifier" | "dimension" | "metric" | "timestamp";

export interface ColumnDefinition {
  key: string;                 // Nama kolom teknis di CSV (e.g. "gross_revenue")
  label: string;               // Label visual UI (e.g. "Gross Revenue")
  type: DataType;
  role: ColumnRole;
  required: boolean;
  unit?: string;               // "IDR", "pcs", "hari", "%"
  description: string;         // Penjelasan ringkas untuk AI & pengguna
  sampleValues: (string | number)[];
}

export interface DomainTemplate {
  id: "sales_revenue" | "inventory_operations" | "marketing_campaign";
  title: string;               // "Penjualan & Omzet"
  badge: string;               // "Retail & E-Commerce"
  icon: string;                // Emoji atau icon identifier
  description: string;
  primaryKpi: string;          // Key kolom KPI utama
  defaultDateKey?: string;     // Key kolom tanggal utama
  defaultCategoryKey?: string; // Key kolom kategori utama
  currency?: string;           // "IDR" | "USD"
  columns: ColumnDefinition[];
  sampleRows: Record<string, string | number>[];
  dosAndDonts: {
    dos: string[];
    donts: string[];
  };
}

export interface ValidationIssue {
  type: "error" | "warning";
  code: "MISSING_REQUIRED_COLUMN" | "DATA_TYPE_MISMATCH" | "EMPTY_DATASET" | "HIGH_NULL_RATIO" | "FORMAT_VIOLATION";
  message: string;
  column?: string;
  row?: number;
}

export interface ValidationReport {
  isValid: boolean;
  healthScore: number;         // 0 - 100
  matchedTemplateId?: string;
  matchedColumns: string[];
  missingRequiredColumns: string[];
  extraColumns: string[];
  issues: ValidationIssue[];
}

/* ── User-Defined Semantic Metadata Specification ─────────────── */

export interface UserColumnMeta {
  columnName: string;          // Nama teknis kolom di data.csv
  displayName: string;         // Label manusiawi
  dataType: DataType;          // string, number, date, boolean
  role: ColumnRole;            // identifier, dimension, metric, timestamp
  unit?: string;               // e.g. "IDR", "pcs", "hari", "g/dL", "%"
  description: string;         // Penjelasan arti dan fungsi kolom bagi AI
}

export interface TableMetadata {
  tableName?: string;          // Judul tabel
  tableDescription: string;    // Konteks bisnis / sasaran analisis tabel dari pengguna
  primaryKpi: string;          // Kolom metrik utama (KPI)
  currencyOrUnit?: string;     // Mata uang atau satuan umum
}

export interface UserDefinedDataset {
  data: Record<string, unknown>[];
  tableMetadata: TableMetadata;
  columnsMetadata: UserColumnMeta[];
}
