"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isDemoReadonly } from "@/lib/demo";

/**
 * Formulario crear/editar artículo. Consume API REST pública (demo sin login).
 * @param {{ mode?: 'new' | 'edit', itemId?: string, initial?: object }} props
 */
export function ItemForm({ mode = "new", itemId, initial }) {
  const readonly = isDemoReadonly();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "u");
  const [minStock, setMinStock] = useState(initial?.minStock ?? 0);
  const [maxStock, setMaxStock] = useState(initial?.maxStock ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    if (readonly) return;
    setError("");
    setLoading(true);
    const payload = {
      sku,
      name,
      description: description || null,
      unit,
      minStock: parseInt(minStock, 10) || 0,
      maxStock: maxStock === "" ? null : parseInt(maxStock, 10),
      categoryId: categoryId || null,
      ...(mode === "edit" ? { active } : {}),
    };
    try {
      const url = mode === "new" ? "/api/items" : `/api/items/${itemId}`;
      const res = await fetch(url, {
        method: mode === "new" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Error al guardar");
        return;
      }
      router.push(`/items/${data.id}`);
      router.refresh();
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="ui-card mx-auto max-w-xl space-y-5 p-5 sm:p-7"
    >
      {error ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {readonly ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          Esta demo está en <strong>solo lectura</strong>. No se pueden crear ni editar
          artículos desde el formulario.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-1">
          <span className="ui-label">SKU *</span>
          <input
            required
            className="ui-input"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            disabled={readonly || mode === "edit"}
            title="El SKU no se puede cambiar si hay movimientos asociados"
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="ui-label">Unidad</span>
          <input
            className="ui-input"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="u, kg, caja…"
            disabled={readonly}
          />
        </label>
      </div>

      <label className="block">
        <span className="ui-label">Nombre *</span>
        <input
          required
          className="ui-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={readonly}
        />
      </label>

      <label className="block">
        <span className="ui-label">Descripción</span>
        <textarea
          className="ui-input min-h-[88px] resize-y"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={readonly}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="ui-label">Stock mínimo</span>
          <input
            type="number"
            min={0}
            className="ui-input"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            disabled={readonly}
          />
        </label>
        <label className="block">
          <span className="ui-label">Stock máximo</span>
          <input
            type="number"
            min={0}
            className="ui-input"
            value={maxStock}
            onChange={(e) => setMaxStock(e.target.value)}
            placeholder="Opcional"
            disabled={readonly}
          />
        </label>
      </div>

      <label className="block">
        <span className="ui-label">Categoría</span>
        <select
          className="ui-input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={readonly}
        >
          <option value="">— Sin categoría —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {mode === "edit" ? (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            disabled={readonly}
          />
          Activo
        </label>
      ) : null}

      <button
        type="submit"
        disabled={readonly || loading}
        className="ui-btn-primary w-full sm:w-auto sm:px-10"
      >
        {loading ? "Guardando…" : mode === "new" ? "Crear artículo" : "Guardar cambios"}
      </button>
    </form>
  );
}
