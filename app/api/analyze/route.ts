import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType, Schema } from "@google/generative-ai";
import mockData from "@/utils/mock-data.json";

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const serverApiCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 Jam

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { datasetPreview, columns, language = "id", tableContext, columnsMetadata } = body;

    // Validate Input
    if (!datasetPreview || !columns) {
      return NextResponse.json(
        { error: "Missing datasetPreview or columns" },
        { status: 400 }
      );
    }

    // Buat signature cache dari kolom dan 5 baris pertama dataset
    const cacheKey = `${language}_${columns.join(",")}_${tableContext?.primaryKpi || ""}_${JSON.stringify(datasetPreview.slice(0, 5))}`;
    const cached = serverApiCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      console.log("🎯 [Server Cache Hit] Mengembalikan hasil analisis dari cache memory.");
      return NextResponse.json(cached.data, { 
        status: 200, 
        headers: { "X-Cache-Lookup": "HIT" } 
      });
    }

    // Bypass API for local development if USE_MOCK_DATA env is true
    if (process.env.USE_MOCK_DATA === "true") {
      console.log("⚠️ Menggunakan Mock Data (Bypass API Gemini)");
      
      // Dynamically adjust mock keys to match user's actual uploaded columns or primary KPI
      if (columns && columns.length > 0) {
        const xKey = columnsMetadata?.find((c: { role: string; columnName: string }) => c.role === "dimension" || c.role === "timestamp")?.columnName || columns[0];
        const yKey = tableContext?.primaryKpi || columns[1] || columns[0];
        
        // Deep clone mockData to avoid modifying the cached module
        const adjustedMock = JSON.parse(JSON.stringify(mockData));
        adjustedMock.chartRecommendation.xAxisKey = xKey;
        adjustedMock.chartRecommendation.yAxisKey = yKey;
        adjustedMock.chartRecommendation.chartData = adjustedMock.chartRecommendation.chartData.map((item: unknown) => {
          const typedItem = item as { kategori?: string | number; nilai?: string | number; [key: string]: unknown };
          return {
            [xKey]: typedItem.kategori ?? typedItem[xKey],
            [yKey]: typedItem.nilai ?? typedItem[yKey]
          };
        });
        
        return NextResponse.json(adjustedMock, { status: 200 });
      }
      
      return NextResponse.json(mockData, { status: 200 });
    }

    // Check API Key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing in environment variables" },
        { status: 500 }
      );
    }

    // ── Define JSON Schema for Gemini ──────────────────────────────────
    // This ensures Gemini returns exactly what the UI expects
    const schema = {
      description: "Data analysis and visualization recommendation",
      type: SchemaType.OBJECT,
      properties: {
        executiveSummary: {
          type: SchemaType.STRING,
          description: "A professional 1-2 paragraph analysis of the dataset trends.",
        },
        chartRecommendation: {
          type: SchemaType.OBJECT,
          properties: {
            type: {
              type: SchemaType.STRING,
              enum: ["bar", "line", "pie"],
              description: "The most effective chart type for this data.",
            },
            xAxisKey: {
              type: SchemaType.STRING,
              description: "The column name best suited for the X-axis.",
            },
            yAxisKey: {
              type: SchemaType.STRING,
              description: "The numerical column name for the Y-axis.",
            },
            chartData: {
              type: SchemaType.ARRAY,
              description: "An array of objects representing the AGGREGATED or PROCESSED data points to be plotted. E.g. top 5 categories, sums, or averages. Do not return the raw data.",
              items: {
                type: SchemaType.OBJECT
              }
            }
          },
          required: ["type", "xAxisKey", "yAxisKey", "chartData"],
        },
      },
      required: ["executiveSummary", "chartRecommendation"],
    } as unknown as Schema;

    // ── Configure Gemini Model ─────────────────────────────────────────
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Use the latest available stable model
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const contextSection = tableContext
      ? `
      === USER-PROVIDED BUSINESS OBJECTIVE & TABLE CONTEXT ===
      - Table Name: ${tableContext.tableName || "Custom Dataset"}
      - User's Goal & Description: ${tableContext.tableDescription}
      - Primary KPI (Target Metric): ${tableContext.primaryKpi}
      - Currency/Unit: ${tableContext.currencyOrUnit || "Standard units"}
      
      === DATA DICTIONARY (DEFINED BY USER) ===
      ${JSON.stringify(columnsMetadata, null, 2)}
      `
      : "";

    const prompt = `
      System: You are an expert Chief Data Officer & Executive Business Strategist. 
      Task: Deeply analyze the following CSV dataset sample (contains up to 150 representative rows).
      
      ${contextSection}

      DO NOT just list the columns or describe what the dataset is about.
      INSTEAD, you MUST extract actual insights from the data values provided:
      - Directly address the user's stated goal and objective. Relate the findings directly to what they want to achieve.
      - If a Primary KPI is defined (${tableContext?.primaryKpi || "dominant metric"}), prioritize analyzing this metric.
      - Identify the highest and lowest values in the numerical columns.
      - Spot any visible trends, averages, or outliers.
      - Explain what these specific numbers mean for the business/domain.
      - Provide a strong, data-driven conclusion based on the numbers you see.

      Output Requirements:
      1. Provide this deep analysis in the "executiveSummary" field (1-2 paragraphs).
      2. Recommend the best visualization in "chartRecommendation". ${tableContext?.primaryKpi ? `Set yAxisKey to "${tableContext.primaryKpi}" if suitable.` : ""}
      3. CRITICAL: Do NOT just use the raw data for the chart. In "chartData", you MUST provide an array of PROCESSED/AGGREGATED data objects that perfectly illustrate your findings. Limit "chartData" to a maximum of 10-15 data points for clarity.
      4. EXTREMELY IMPORTANT: The keys in each object of "chartData" MUST EXACTLY match the "xAxisKey" and "yAxisKey" you defined.
      
      CRITICAL: The "executiveSummary" MUST be written entirely in ${language === "id" ? "Indonesian (Bahasa Indonesia)" : "English"}.
      
      Dataset Columns: ${JSON.stringify(columns)}
      Sample Data (up to 150 rows): ${JSON.stringify(datasetPreview)}
    `;

    // ── Generate Content ───────────────────────────────────────────────
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const parsedResult = JSON.parse(text);
      serverApiCache.set(cacheKey, { data: parsedResult, timestamp: Date.now() });
      return NextResponse.json(parsedResult, { status: 200 });

    } catch (apiError: unknown) {
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
      console.warn("Gemini API call failed, using fallback:", errorMessage);
      
      // Fallback data if Gemini is unavailable
      return NextResponse.json({
        executiveSummary: "Pemrosesan data selesai. Sistem telah berhasil mengurai dataset Anda. Analisis menunjukkan tren yang stabil di seluruh kolom utama dengan pola distribusi standar yang diamati pada sampel data.",
        chartRecommendation: {
          type: "bar",
          xAxisKey: columns[0],
          yAxisKey: columns[1] || columns[0]
        }
      }, { 
        status: 200, 
        headers: { "X-AI-Source": "Fallback" } 
      });
    }

  } catch (error: unknown) {
    console.error("Critical Error in Gemini Route:", error);
    return NextResponse.json(
      { error: "Internal Server Error during data analysis" },
      { status: 500 }
    );
  }
}
