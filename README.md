<div align="center">
  <h1>🚀 AI-Powered Data Analytics Dashboard</h1>
  <p><strong>Transforming raw CSV data into actionable, executive-level insights instantly.</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![OpenAI](https://img.shields.io/badge/OpenAI-SDK-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
</div>

<br />

> **The Problem:** Modern enterprises generate massive amounts of data, but extracting meaningful insights requires days of manual processing by data teams.  
> **The Solution:** A serverless, AI-driven dashboard that ingests raw data and outputs dynamic visualizations alongside narrative executive summaries in seconds.

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🧠 **AI Insights Engine** | Automates the extraction of statistical narratives and hidden anomalies without manual SQL queries. |
| 📊 **Interactive Charts** | Intelligent, dynamic data visualization that automatically selects the best chart type based on your data structure. |
| 📑 **Executive Summaries** | Generates real-time, human-readable reports using OpenAI's LLMs tailored for C-Level decision-makers. |
| ⚡ **Client-Side Heavy Lifting** | Drastically reduces upload bottlenecks by parsing large CSV files directly in the browser. |

## 🏗 System Architecture

The application is built on a scalable, modern architecture utilizing a secure serverless proxy to protect AI integration layers.

```mermaid
graph TD
    %% Entities
    Client["Browser / UI Client<br/>(Tailwind CSS)"]
    Frontend["Next.js 14 Client Components<br/>(CSV Parsing & Validation)"]
    Backend["Next.js API Routes<br/>(Serverless Proxy)"]
    OpenAI["OpenAI API<br/>(LLM Engine)"]
    ChartEngine["Charting Library<br/>(Recharts / Chart.js)"]

    %% Flow
    Client -- "1. Upload CSV (Drag & Drop)" --> Frontend
    Frontend -- "2. Parse & Extract Metadata<br/>(Local processing)" --> Frontend
    Frontend -- "3. Send Metadata & Sample Data<br/>(JSON Payload)" --> Backend
    Backend -- "4. Construct Prompt & Request Insight" --> OpenAI
    OpenAI -- "5. Return Executive Summary<br/>& Chart Recommendations" --> Backend
    Backend -- "6. Send Processed Insights" --> Frontend
    Frontend -- "7a. Pass Data for Visualization" --> ChartEngine
    ChartEngine -- "Render Interactive Charts" --> Client
    Frontend -- "7b. Render Narrative Text" --> Client

    %% Styling
    classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef nextjs fill:#000,stroke:#fff,stroke-width:2px,color:#fff;
    classDef external fill:#10a37f,stroke:#fff,stroke-width:2px,color:#fff;
    classDef engine fill:#ff7300,stroke:#fff,stroke-width:2px,color:#fff;
    
    class Client client;
    class Frontend,Backend nextjs;
    class OpenAI external;
    class ChartEngine engine;
```

## 💻 Tech Stack

- **Framework:** [Next.js 14 (App Router)](https://nextjs.org/) for full-stack serverless capabilities.
- **AI Integration:** [OpenAI SDK](https://platform.openai.com/docs/libraries) for Natural Language Processing & Summarization.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for rapid, utility-first UI development.
- **Language:** [TypeScript](https://www.typescriptlang.org/) for robust, type-safe code.

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js 18.17 or later
- An active OpenAI API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ai-powered-data-dashboard.git
   cd ai-powered-data-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the App:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 💎 Why This Project?

This application serves as a prime example of an **enterprise-grade solution** designed to accelerate decision-making processes. By eliminating the friction between raw data ingestion and actionable insights, it empowers product managers and executives to make highly informed, data-driven decisions with zero technical overhead. The integration of modern serverless architecture guarantees high scalability while ensuring rigorous data privacy standards.
