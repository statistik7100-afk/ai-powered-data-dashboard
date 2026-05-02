"use client";

import React from "react";
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

const COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg border border-white/10 bg-[#0f172a]/90 p-3 shadow-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-300">{label}</p>
        <p className="text-sm font-bold text-indigo-400">
          {payload[0].name}: <span className="text-slate-100">{payload[0].value}</span>
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
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500 italic">
        No data available to visualize.
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2 }} />
            <Line
              type="monotone"
              dataKey={yAxisKey}
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#0a0f1e" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={yAxisKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#64748b', paddingTop: '10px' }} />
          </PieChart>
        );
      case "bar":
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar
              dataKey={yAxisKey}
              fill="url(#colorGradient)"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
             <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={1} />
              </linearGradient>
            </defs>
          </BarChart>
        );
    }
  };

  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default DynamicChart;
