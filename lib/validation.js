/**
 * Helpers de validación y normalización de input para las API Routes.
 *
 * Estos helpers son funciones puras (sin Prisma) para que se puedan probar
 * con Vitest sin base de datos. Se centralizan aquí los límites de longitud
 * y el parseo numérico que antes estaba duplicado en cada route.
 *
 * Como la API es pública (sin auth) y cualquiera puede llamarla si el sitio
 * está desplegado, los límites protegen contra abusos (DoS por inputs gigantes,
 * bloat de DB con strings ilimitados, etc.).
 */

/**
 * Límites máximos de tamaño para inputs. Pensados para una demo de portafolio:
 *  - Strings cortos (sku, código, unit) acotados a ~100 chars.
 *  - Strings de UI (nombre, código de barras) ~200.
 *  - Descripciones y notas hasta unos KB.
 *  - `imageUrl` admite data URLs base64 (foto de cámara) → ~2 MB.
 *  - `lines` en un movimiento acotado para evitar payloads enormes.
 */
export const LIMITS = Object.freeze({
  name: 200,
  sku: 100,
  description: 2000,
  unit: 20,
  image_url: 2_000_000,
  barcode: 200,
  code: 100,
  reference: 200,
  notes: 2000,
  query: 200,
  lines: 200,
});

/**
 * Error de validación con código identificable para mapearlo a HTTP.
 * `code === "STRING_TOO_LONG"` → 413; otros mensajes → 400.
 */
export class validation_error extends Error {
  /**
   * @param {string} message Mensaje legible para el usuario.
   * @param {{ code?: string; field?: string }} [meta]
   */
  constructor(message, meta = {}) {
    super(message);
    this.name = "validation_error";
    this.code = meta.code ?? "VALIDATION";
    this.field = meta.field;
  }
}

/**
 * Normaliza un valor a string limpio (trim) o `null` si queda vacío.
 * Lanza `validation_error` con `code: "STRING_TOO_LONG"` si excede `max`.
 *
 * @param {unknown} value Valor crudo del body.
 * @param {number} max Máximo permitido en caracteres.
 * @param {string} [field] Nombre del campo (para el error).
 * @returns {string | null}
 */
export function clean_string(value, max, field) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  if (s.length > max) {
    throw new validation_error(
      field
        ? `${field} excede el máximo permitido (${max} caracteres)`
        : `Texto excede el máximo permitido (${max} caracteres)`,
      { code: "STRING_TOO_LONG", field }
    );
  }
  return s;
}

/**
 * Convierte a entero no negativo. Si el valor no es numérico finito, devuelve
 * `fallback`. Si es numérico pero negativo, lo clava en 0.
 *
 * @param {unknown} value
 * @param {number} [fallback=0]
 * @returns {number}
 */
export function to_non_negative_int(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.trunc(n));
}

/**
 * Convierte a entero o `null`. Acepta `null`/`""`/`undefined` → `null`.
 * Si no es numérico finito, también devuelve `null`.
 *
 * @param {unknown} value
 * @returns {number | null}
 */
export function to_optional_int(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

/**
 * Clampa el parámetro `take` para listados paginados.
 *
 * @param {unknown} value Valor crudo (e.g. de `searchParams.get("take")`).
 * @param {{ default_value?: number; max?: number }} [options]
 * @returns {number}
 */
export function parse_take(value, { default_value = 30, max = 50 } = {}) {
  const n = parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n) || n <= 0) return default_value;
  return Math.min(max, n);
}

/**
 * Recorta el parámetro de búsqueda `q` a `LIMITS.query` chars para acotar
 * el coste del `contains` en Postgres y devolver una cadena estable.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function clean_search_query(value) {
  if (value == null) return "";
  const s = String(value).trim();
  if (!s) return "";
  return s.slice(0, LIMITS.query);
}

const ALLOWED_MOVEMENT_TYPES = Object.freeze([
  "IN",
  "OUT",
  "TRANSFER",
  "ADJUST",
]);

/**
 * Comprueba si `type` es un tipo de movimiento soportado.
 * @param {unknown} type
 * @returns {boolean}
 */
export function is_movement_type(type) {
  return (
    typeof type === "string" && ALLOWED_MOVEMENT_TYPES.includes(type.toUpperCase())
  );
}

/**
 * Valida y normaliza las líneas de un movimiento.
 * Lanza `validation_error` con un mensaje legible si algo es inválido.
 *
 * @param {unknown} raw_lines
 * @param {string} type Tipo de movimiento ya normalizado (IN/OUT/TRANSFER/ADJUST).
 * @returns {Array<{
 *   itemId: string;
 *   quantity: number;
 *   fromLocationId: string | null;
 *   toLocationId: string | null;
 * }>}
 */
export function parse_movement_lines(raw_lines, type) {
  if (!Array.isArray(raw_lines) || raw_lines.length === 0) {
    throw new validation_error("Debe incluir al menos una línea", {
      code: "LINES_EMPTY",
    });
  }
  if (raw_lines.length > LIMITS.lines) {
    throw new validation_error(
      `Demasiadas líneas en un solo movimiento (máx ${LIMITS.lines})`,
      { code: "LINES_TOO_MANY" }
    );
  }

  const lines = [];
  for (const raw of raw_lines) {
    const item_id = clean_string(raw?.itemId, 64, "itemId");
    if (!item_id) {
      throw new validation_error("Cada línea requiere itemId", {
        code: "ITEM_REQUIRED",
      });
    }
    const quantity = parseInt(raw?.quantity, 10);
    if (!Number.isFinite(quantity)) {
      throw new validation_error("Cantidad numérica inválida", {
        code: "QUANTITY_INVALID",
      });
    }
    if (type !== "ADJUST" && quantity <= 0) {
      throw new validation_error(
        "Para este tipo la cantidad debe ser mayor que cero",
        { code: "QUANTITY_NOT_POSITIVE" }
      );
    }
    const from_location_id = clean_string(raw?.fromLocationId, 64, "fromLocationId");
    const to_location_id = clean_string(raw?.toLocationId, 64, "toLocationId");

    lines.push({
      itemId: item_id,
      quantity,
      fromLocationId: from_location_id,
      toLocationId: to_location_id,
    });
  }
  return lines;
}
