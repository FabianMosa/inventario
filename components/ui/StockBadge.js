import React from "react";

/**
 * Status variants mapping for stock levels.
 * Maps status keys to Tailwind style tokens and labels.
 */
const STATUS_VARIANTS = {
  in_stock: {
    label: "En Stock",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    border: "border-emerald-500/20 dark:border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-400",
    led: "bg-emerald-500",
  },
  low_stock: {
    label: "Stock Bajo",
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    border: "border-amber-500/20 dark:border-amber-500/30",
    text: "text-amber-700 dark:text-amber-400",
    led: "bg-amber-500 animate-pulse",
  },
  out_of_stock: {
    label: "Agotado",
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    border: "border-rose-500/20 dark:border-rose-500/30",
    text: "text-rose-700 dark:text-rose-400",
    led: "bg-rose-500",
  },
  overstock: {
    label: "Exceso",
    bg: "bg-sky-500/10 dark:bg-sky-500/15",
    border: "border-sky-500/20 dark:border-sky-500/30",
    text: "text-sky-700 dark:text-sky-400",
    led: "bg-sky-500",
  },
};

/**
 * Reusable stock status badge with LED indicator dot.
 * @param {Object} props Component props.
 * @param {"in_stock" | "low_stock" | "out_of_stock" | "overstock"} props.status Stock status key.
 * @param {string} [props.customLabel] Optional custom text label override.
 * @param {string} [props.className] Optional extra Tailwind CSS classes.
 * @returns {JSX.Element} Rendered badge component.
 */
export function StockBadge({ status = "in_stock", customLabel, className = "" }) {
  const current_variant = STATUS_VARIANTS[status] || STATUS_VARIANTS.in_stock;
  const badge_label = customLabel || current_variant.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm ${current_variant.bg} ${current_variant.border} ${current_variant.text} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${current_variant.led}`}
        aria-hidden="true"
      />
      <span>{badge_label}</span>
    </span>
  );
}
