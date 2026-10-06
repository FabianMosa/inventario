"use client";

import React, { useState } from "react";

/**
 * Interactive SVG Chart component for Inventory Trends & Status Distribution.
 * @param {Object} props Component props.
 * @param {number} [props.inStockCount] Number of items in stock.
 * @param {number} [props.lowStockCount] Number of items in low stock.
 * @param {number} [props.outOfStockCount] Number of items out of stock.
 * @returns {JSX.Element} Rendered InventoryCharts component.
 */
export function InventoryCharts({
  inStockCount = 0,
  lowStockCount = 0,
  outOfStockCount = 0,
}) {
  const [hovered_point, set_hovered_point] = useState(null);

  const total_items = inStockCount + lowStockCount + outOfStockCount;
  const in_stock_pct = total_items > 0 ? Math.round((inStockCount / total_items) * 100) : 0;
  const low_stock_pct = total_items > 0 ? Math.round((lowStockCount / total_items) * 100) : 0;
  const out_of_stock_pct = total_items > 0 ? Math.max(0, 100 - in_stock_pct - low_stock_pct) : 0;

  // Pre-calculated mock trend points for visual appeal
  const trend_data = [
    { day: "Día 1", value: 340, sales: 120 },
    { day: "Día 5", value: 410, sales: 180 },
    { day: "Día 10", value: 390, sales: 150 },
    { day: "Día 15", value: 520, sales: 240 },
    { day: "Día 20", value: 480, sales: 210 },
    { day: "Día 25", value: 610, sales: 310 },
    { day: "Día 30", value: 680, sales: 350 },
  ];

  // Calculate SVG curve path points
  const width = 500;
  const height = 160;
  const padding = 20;
  const max_val = 800;

  const points = trend_data.map((d, index) => {
    const x = padding + (index / (trend_data.length - 1)) * (width - 2 * padding);
    const y = height - padding - (d.value / max_val) * (height - 2 * padding);
    return { x, y, ...d };
  });

  const path_d = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, "");

  const area_d = `${path_d} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  // Donut chart calculations
  const donut_size = 120;
  const stroke_width = 14;
  const radius = (donut_size - stroke_width) / 2;
  const circumference = 2 * Math.PI * radius;

  const stroke_in = (in_stock_pct / 100) * circumference;
  const stroke_low = (low_stock_pct / 100) * circumference;
  const stroke_out = (out_of_stock_pct / 100) * circumference;

  const offset_low = circumference - stroke_in;
  const offset_out = circumference - stroke_in - stroke_low;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Line Chart Panel */}
      <div className="lg:col-span-7 ui-card p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Tendencia de Inventario y Movimientos
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Comportamiento del stock en los últimos 30 días
            </p>
          </div>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Últimos 30 días
          </span>
        </div>

        <div className="relative mt-4">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid background lines */}
            <line x1="20" y1="30" x2="480" y2="30" stroke="#27272a" strokeOpacity="0.2" strokeDasharray="4 4" />
            <line x1="20" y1="80" x2="480" y2="80" stroke="#27272a" strokeOpacity="0.2" strokeDasharray="4 4" />
            <line x1="20" y1="130" x2="480" y2="130" stroke="#27272a" strokeOpacity="0.2" strokeDasharray="4 4" />

            {/* Filled Gradient Area */}
            <path d={area_d} fill="url(#chartGradient)" />

            {/* Line Path */}
            <path
              d={path_d}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data Points */}
            {points.map((pt, i) => (
              <g key={i} className="cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hovered_point === i ? 6 : 4}
                  fill="#6366f1"
                  stroke="#ffffff"
                  strokeWidth="2"
                  onMouseEnter={() => set_hovered_point(i)}
                  onMouseLeave={() => set_hovered_point(null)}
                  className="transition-all duration-150"
                />
              </g>
            ))}
          </svg>

          {/* Hover Tooltip */}
          {hovered_point !== null ? (
            <div
              className="absolute pointer-events-none rounded-lg border border-slate-200 bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-xl dark:border-zinc-700"
              style={{
                left: `${(points[hovered_point].x / width) * 100}%`,
                top: `${(points[hovered_point].y / height) * 100 - 35}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="font-semibold text-brand-400">
                {points[hovered_point].day}
              </div>
              <div className="text-[11px] tabular-nums">
                Stock: {points[hovered_point].value} u.
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Donut Distribution Panel */}
      <div className="lg:col-span-5 ui-card p-5 sm:p-6 flex flex-col justify-between">
        <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            Distribución de Existencias
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Estado global de los artículos en catálogo
          </p>
        </div>

        <div className="my-4 flex items-center justify-around gap-4">
          <div className="relative flex items-center justify-center">
            <svg width={donut_size} height={donut_size} className="-rotate-90 transform">
              <circle
                cx={donut_size / 2}
                cy={donut_size / 2}
                r={radius}
                stroke="#27272a"
                strokeWidth={stroke_width}
                fill="none"
                opacity={0.2}
              />
              {/* In Stock Arc */}
              <circle
                cx={donut_size / 2}
                cy={donut_size / 2}
                r={radius}
                stroke="#10b981"
                strokeWidth={stroke_width}
                fill="none"
                strokeDasharray={`${stroke_in} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
              />
              {/* Low Stock Arc */}
              <circle
                cx={donut_size / 2}
                cy={donut_size / 2}
                r={radius}
                stroke="#f59e0b"
                strokeWidth={stroke_width}
                fill="none"
                strokeDasharray={`${stroke_low} ${circumference}`}
                strokeDashoffset={-stroke_in}
                strokeLinecap="round"
              />
              {/* Out of Stock Arc */}
              <circle
                cx={donut_size / 2}
                cy={donut_size / 2}
                r={radius}
                stroke="#f43f5e"
                strokeWidth={stroke_width}
                fill="none"
                strokeDasharray={`${stroke_out} ${circumference}`}
                strokeDashoffset={-stroke_in - stroke_low}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-zinc-100">
                {total_items}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Ítems
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-zinc-400">En Stock:</span>
              <span className="font-bold tabular-nums text-slate-900 dark:text-zinc-100">{in_stock_pct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 dark:text-zinc-400">Stock Bajo:</span>
              <span className="font-bold tabular-nums text-slate-900 dark:text-zinc-100">{low_stock_pct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 dark:text-zinc-400">Agotados:</span>
              <span className="font-bold tabular-nums text-slate-900 dark:text-zinc-100">{out_of_stock_pct}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
