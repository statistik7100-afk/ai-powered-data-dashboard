import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
// It will automatically use process.env.OPENAI_API_KEY
const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    // Parse the request payload
    const body = await req.json();
    const { datasetPreview, columns } = body;

    // Validate the payload
    if (!datasetPreview || !columns) {
      return NextResponse.json(
        { error: "Missing datasetPreview or columns in request body" },
        { status: 400 }
      );
    }

    // Ensure API Key exists
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API Key is missing. Please configure .env.local" },
        { status: 500 }
      );
    }

    const systemPrompt = `
You are a Senior Data Analyst and Business Strategist. 
You will be provided with the columns of a dataset and a small sample of the data.
Your task is to analyze this data and provide two things in a strict JSON format:
1. "executiveSummary": A concise, highly professional narrative (1-2 paragraphs max) summarizing what this dataset represents, identifying any obvious trends or anomalies from the sample, and explaining its potential business value. Use a tone suitable for C-Level executives.
2. "chartRecommendation": An object representing the best way to visualize this data. It should have:
   - "type": either "bar", "line", or "pie"
   - "xAxisKey": the exact name of the column best suited for the X-axis (usually a categorical or time-based column)
   - "yAxisKey": the exact name of the column best suited for the Y-axis (must be a numerical column)

Return ONLY a valid JSON object. Do not include markdown code blocks.
`;

    const userPrompt = `
Columns: ${JSON.stringify(columns)}
Sample Data: ${JSON.stringify(datasetPreview)}
`;

    // Request analysis from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective & fast for MVP
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" }, // Enforce JSON output
      temperature: 0.3, // Lower temp for more deterministic, analytical output
    });

    const aiContent = response.choices[0].message.content;
    
    if (!aiContent) {
      throw new Error("No content received from OpenAI");
    }

    // Parse the JSON string from OpenAI into an object
    const result = JSON.parse(aiContent);

    // Return the result to the client
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error("Error in AI Analysis Route:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during AI analysis" },
      { status: 500 }
    );
  }
}
