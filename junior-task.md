# Junior Developer Task: Implementasi Mock Data & Caching API Gemini

Halo! Kita saat ini mengalami kendala limitasi API Gemini (20 Requests Per Day) pada Google AI Studio Free Tier yang sangat cepat habis ketika kita melakukan refresh halaman untuk merapikan UI.

Tugas kamu adalah mengimplementasikan mekanisme **Mock Data** dan **Caching** yang sangat minimalis tanpa merombak arsitektur utama. Ikuti instruksi taktis di bawah ini secara presisi:

## 1. Buat Mock Data Lokal
Buat file baru di `utils/mock-data.json`.
Isi dengan JSON statis yang strukturnya sesuai dengan skema kembalian API saat ini:
```json
{
  "executiveSummary": "[MOCK DATA] Pemrosesan data selesai. Ini adalah data statis untuk keperluan development UI agar tidak memotong kuota API Gemini.",
  "chartRecommendation": {
    "type": "bar",
    "xAxisKey": "kategori",
    "yAxisKey": "nilai",
    "chartData": [
      { "kategori": "A", "nilai": 100 },
      { "kategori": "B", "nilai": 200 },
      { "kategori": "C", "nilai": 150 }
    ]
  }
}
```

## 2. Injeksi Bypass di Backend (API Route)
Buka file `app/api/analyze/route.ts`.
Tepat di dalam fungsi `export async function POST(req: Request) {` pada baris ke-8, tambahkan logic bypass menggunakan environment variable:
```typescript
    // TAMBAHKAN BLOK INI: Bypass untuk Development
    if (process.env.USE_MOCK_DATA === "true") {
      console.log("⚠️ Menggunakan Mock Data (Bypass API Gemini)");
      const mockData = require('@/utils/mock-data.json');
      return NextResponse.json(mockData, { status: 200 });
    }
```
*Pastikan kamu menambahkan `USE_MOCK_DATA=true` di file `.env.local` saat mendevelop.*

## 3. Injeksi Caching Ringan di Frontend (Dashboard Context)
Buka file `context/DashboardContext.tsx`.
Fokus pada fungsi `processDataset` (sekitar baris 61). Kita akan menambahkan `sessionStorage` (agar cache bertahan saat refresh, tapi hilang saat tab ditutup).

**Sebelum baris ke-97 (pemanggilan `fetch`):**
```typescript
      // --- LOGIC CACHE START ---
      const cacheKey = `ai_report_${file.name}_${file.size}_${state.language}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      
      if (cachedData) {
        console.log("🚀 Mengambil data dari Cache Storage (Menghemat API!)");
        const aiReport = JSON.parse(cachedData);
        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          aiReport,
        }));
        return; // Hentikan fungsi di sini, jangan panggil fetch
      }
      // --- LOGIC CACHE END ---
```

**Setelah baris ke-112 (`const aiReport: AiReport = await response.json();`):**
```typescript
      // Simpan hasil fetch ke cache untuk re-render berikutnya
      sessionStorage.setItem(cacheKey, JSON.stringify(aiReport));
```

**Catatan Tambahan:**
Kerjakan dengan hati-hati. Jangan ubah struktur UI, context state default, atau logika parsing CSV (PapaParse). Beritahu jika sudah selesai diimplementasi!
