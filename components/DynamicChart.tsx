"use client";

import React from "react";
import { useDashboard } from "@/context/DashboardContext";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DynamicChartProps {
  data: any[];
  type: "bar" | "line" | "pie";
  xAxisKey: string;
  yAxisKey: string;
}

const GOOGLE_CHART_COLORS = [
  "#1A73E8", // Google Classic Blue
  "#129EAF", // Google Teal
  "#E37400", // Warm Amber
  "#D93025", // Google Coral Red
  "#9334E6", // Vivid Purple
  "#1E8E3E", // Google Green
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="m3-card-elevated border border-[var(--md-sys-color-border-subtle)] bg-[var(--md-sys-color-surface)] p-3 shadow-lg rounded-xl">
        <p className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">{label}</p>
        <p className="mt-1 text-sm font-bold text-[var(--md-sys-color-primary)]">
          {payload[0].name}:{" "}
          <span className="text-[var(--md-sys-color-on-surface)] font-semibold">
            {typeof payload[0].value === "number"
              ? payload[0].value.toLocaleString()
              : payload[0].value}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const DynamicChart: React.FC<DynamicChartProps> = ({
  data,
  type,
  xAxisKey,
  yAxisKey,
}) => {
  const { language } = useDashboard();
  
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--md-sys-color-on-surface-variant)] italic">
        {language === "id" ? "Tidak ada data untuk divisualisasikan." : "No data available to visualize."}
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-border-subtle)" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              stroke="var(--md-sys-color-outline)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="var(--md-sys-color-outline)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-8}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--md-sys-color-primary)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
            <Line
              type="monotone"
              dataKey={yAxisKey}
              stroke="#1A73E8"
              strokeWidth={3}
              dot={{ r: 4, fill: "#1A73E8", strokeWidth: 2, stroke: "var(--md-sys-color-surface)" }}
              activeDot={{ r: 6, fill: "#0B57D0", strokeWidth: 2, stroke: "var(--md-sys-color-surface)" }}
              animationDuration={1200}
            />
          </LineChart>
        );
      case "pie":
        return (
          <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <Pie
              data={data}
              dataKey={yAxisKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              animationDuration={1200}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={GOOGLE_CHART_COLORS[index % GOOGLE_CHART_COLORS.length]} stroke="var(--md-sys-color-surface)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', paddingTop: '12px' }}
            />
          </PieChart>
        );
      case "bar":
      default:
        return (
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-border-subtle)" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              stroke="var(--md-sys-color-outline)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="var(--md-sys-color-outline)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-8}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--md-sys-color-surface-container)' }} />
            <Bar
              dataKey={yAxisKey}
              fill="url(#m3ColorGradient)"
              radius={[6, 6, 0, 0]}
              animationDuration={1200}
            />
            <defs>
              <linearGradient id="m3ColorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A73E8" stopOpacity={1} />
                <stop offset="100%" stopColor="#129EAF" stopOpacity={0.85} />
              </linearGradient>
            </defs>
          </BarChart>
        );
    }
  };

  return (
    <div className="h-full w-full min-h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default DynamicChart;
