"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = [
  { value: "IN", label: "Entrada (IN)" },
  { value: "OUT", label: "Salida (OUT)" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "ADJUST", label: "Ajuste (+/-)" },
];

/**
 * Registra un movimiento de una línea (suficiente para demo de portafolio).
 */
export function MovementForm() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [type, setType] = useState("IN");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [fromLocationId, setFromLocationId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/items").then((r) => r.json()),
      fetch("/api/locations").then((r) => r.json()),
    ])
      .then(([it, loc]) => {
        setItems(Array.isArray(it) ? it : []);
        setLocations(Array.isArray(loc) ? loc : []);
      })
      .catch(() => {});
  }, []);

  function buildLine() {
    const qty = parseInt(quantity, 10);
    const line = { itemId, quantity: qty };
    if (type === "IN") {
      line.toLocationId = toLocationId;
    } else if (type === "OUT") {
      line.fromLocationId = fromLocationId;
    } else if (type === "TRANSFER") {
      line.fromLocationId = fromLocationId;
      line.toLocationId = toLocationId;
    } else if (type === "ADJUST") {
      // API usa fromLocationId como ubicación del ajuste
      line.fromLocationId = fromLocationId;
      line.quantity = qty;
    }
    return line;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!itemId) {
      setError("Selecciona un artículo");
      return;
    }
    const qty = parseInt(quantity, 10);
    if (!Number.isFinite(qty)) {
      setError("Cantidad inválida");
      return;
    }
    if (type === "IN" && !toLocationId) {
      setError("Entrada requiere ubicación destino");
      return;
    }
    if (type === "OUT" && !fromLocationId) {
      setError("Salida requiere ubicación origen");
      return;
    }
    if (type === "TRANSFER" && (!fromLocationId || !toLocationId)) {
      setError("Transferencia requiere origen y destino");
      return;
    }
    if (type === "ADJUST" && !fromLocationId) {
      setError("Ajuste requiere ubicación");
      return;
    }
    if (type === "ADJUST" && qty === 0) {
      setError("En ajuste la cantidad no puede ser 0 (use positivo o negativo)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          reference: reference || null,
          notes: notes || null,
          lines: [buildLine()],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo registrar");
        return;
      }
      router.push("/movements");
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

      <label className="block">
        <span className="ui-label">Tipo *</span>
        <select
          className="ui-input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="ui-label">Artículo *</span>
        <select
          required
          className="ui-input"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
        >
          <option value="">— Seleccionar —</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.sku} — {i.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="ui-label">
          Cantidad *{" "}
          {type === "ADJUST" ? (
            <span className="font-normal text-slate-500">
              (negativo reduce stock)
            </span>
          ) : null}
        </span>
        <input
          type="number"
          required
          className="ui-input"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </label>

      {(type === "OUT" || type === "TRANSFER" || type === "ADJUST") && (
        <label className="block">
          <span className="ui-label">
            {type === "ADJUST" ? "Ubicación del ajuste *" : "Ubicación origen *"}
          </span>
          <select
            className="ui-input"
            value={fromLocationId}
            onChange={(e) => setFromLocationId(e.target.value)}
          >
            <option value="">— Seleccionar —</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {(type === "IN" || type === "TRANSFER") && (
        <label className="block">
          <span className="ui-label">Ubicación destino *</span>
          <select
            className="ui-input"
            value={toLocationId}
            onChange={(e) => setToLocationId(e.target.value)}
          >
            <option value="">— Seleccionar —</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block">
        <span className="ui-label">Referencia</span>
        <input
          className="ui-input"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="OC-123, factura, etc."
        />
      </label>

      <label className="block">
        <span className="ui-label">Notas</span>
        <textarea
          className="ui-input min-h-[72px] resize-y"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="ui-btn-primary w-full sm:w-auto sm:px-10"
      >
        {loading ? "Registrando…" : "Registrar movimiento"}
      </button>
    </form>
  );
}
