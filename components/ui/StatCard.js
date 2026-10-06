import React from "react";

/**
 * Reusable KPI Stat Card component for modern SaaS dashboards.
 * @param {Object} props Component props.
 * @param {string} props.title Card header title.
 * @param {string | number} props.value Primary metric numerical display.
 * @param {string} [props.change] Percentage variation or status badge (e.g. "+3.1%").
 * @param {"up" | "down" | "warning" | "neutral"} [props.changeType] Visual style indicator for change.
 * @param {string} [props.subtitle] Helper text below metric value.
 * @param {React.ReactNode} [props.icon] Optional SVG icon component.
 * @param {string} [props.accentColor] Optional accent color class for icon glow/border.
 * @returns {JSX.Element} Rendered StatCard component.
 */
export function StatCard({
  title,
  value,
  change,
  changeType = "up",
  subtitle,
  icon,
  accentColor = "from-brand-500/20 to-brand-500/5 text-brand-600 dark:text-brand-400",
}) {
  const is_positive = changeType === "up";
  const is_negative = changeType === "down";
  const is_warning = changeType === "warning";

  let change_badge_style = "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300";
  if (is_positive) {
    change_badge_style = "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20";
  } else if (is_negative) {
    change_badge_style = "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-500/20";
  } else if (is_warning) {
    change_badge_style = "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/20";
  }

  return (
    <div className="ui-stat-card group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
          {title}
        </span>
        {icon ? (
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br border border-slate-200/50 shadow-sm transition-transform duration-200 group-hover:scale-105 dark:border-zinc-800 ${accentColor}`}
          >
            {icon}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-zinc-100 sm:text-3xl">
          {value}
        </div>
        {change ? (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${change_badge_style}`}
          >
            {is_positive ? "↑ " : is_negative ? "↓ " : ""}
            {change}
          </span>
        ) : null}
      </div>

      {subtitle ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
