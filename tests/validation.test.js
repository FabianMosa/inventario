import { describe, it, expect } from "vitest";
import {
  LIMITS,
  validation_error,
  clean_string,
  to_non_negative_int,
  to_optional_int,
  parse_take,
  clean_search_query,
  is_movement_type,
  parse_movement_lines,
} from "@/lib/validation";

describe("LIMITS", () => {
  it("expone todos los caps esperados y es inmutable (frozen)", () => {
    expect(LIMITS).toMatchObject({
      name: expect.any(Number),
      sku: expect.any(Number),
      description: expect.any(Number),
      unit: expect.any(Number),
      image_url: expect.any(Number),
      barcode: expect.any(Number),
      code: expect.any(Number),
      reference: expect.any(Number),
      notes: expect.any(Number),
      query: expect.any(Number),
      lines: expect.any(Number),
    });
    expect(Object.isFrozen(LIMITS)).toBe(true);
    expect(LIMITS.image_url).toBeGreaterThanOrEqual(1_000_000);
  });
});

describe("clean_string", () => {
  it("devuelve null para null/undefined/cadenas vacías o solo espacios", () => {
    expect(clean_string(null, 10)).toBeNull();
    expect(clean_string(undefined, 10)).toBeNull();
    expect(clean_string("", 10)).toBeNull();
    expect(clean_string("    ", 10)).toBeNull();
  });

  it("recorta espacios y devuelve la cadena limpia", () => {
    expect(clean_string("  hola  ", 10)).toBe("hola");
  });

  it("coerce a string entradas no-string (e.g. número)", () => {
    expect(clean_string(123, 10)).toBe("123");
  });

  it("lanza validation_error con code STRING_TOO_LONG si excede el max", () => {
    const long = "a".repeat(11);
    try {
      clean_string(long, 10, "campo_x");
      throw new Error("no debería llegar aquí");
    } catch (e) {
      expect(e).toBeInstanceOf(validation_error);
      expect(e.code).toBe("STRING_TOO_LONG");
      expect(e.field).toBe("campo_x");
      expect(e.message).toMatch(/campo_x/);
      expect(e.message).toMatch(/10/);
    }
  });

  it("permite cadenas exactamente al límite", () => {
    expect(clean_string("a".repeat(10), 10)).toBe("a".repeat(10));
  });

  it("trim cuenta para el límite, no la entrada original con espacios", () => {
    expect(clean_string("   abc   ", 3)).toBe("abc");
  });
});

describe("to_non_negative_int", () => {
  it("devuelve fallback para null/undefined/''", () => {
    expect(to_non_negative_int(null, 7)).toBe(7);
    expect(to_non_negative_int(undefined, 7)).toBe(7);
    expect(to_non_negative_int("", 7)).toBe(7);
  });

  it("usa fallback 0 por defecto", () => {
    expect(to_non_negative_int(null)).toBe(0);
  });

  it("clava negativos en 0", () => {
    expect(to_non_negative_int(-5)).toBe(0);
    expect(to_non_negative_int("-3")).toBe(0);
  });

  it("trunca decimales", () => {
    expect(to_non_negative_int("12.7")).toBe(12);
  });

  it("devuelve fallback ante valores no numéricos", () => {
    expect(to_non_negative_int("abc", 3)).toBe(3);
    expect(to_non_negative_int({}, 4)).toBe(4);
    expect(to_non_negative_int(NaN, 5)).toBe(5);
    expect(to_non_negative_int(Infinity, 6)).toBe(6);
  });
});

describe("to_optional_int", () => {
  it("devuelve null para null/undefined/''", () => {
    expect(to_optional_int(null)).toBeNull();
    expect(to_optional_int(undefined)).toBeNull();
    expect(to_optional_int("")).toBeNull();
  });

  it("devuelve null para no numéricos / no finitos", () => {
    expect(to_optional_int("abc")).toBeNull();
    expect(to_optional_int(NaN)).toBeNull();
    expect(to_optional_int(Infinity)).toBeNull();
  });

  it("acepta negativos (a diferencia de to_non_negative_int)", () => {
    expect(to_optional_int(-5)).toBe(-5);
  });

  it("trunca decimales", () => {
    expect(to_optional_int("12.9")).toBe(12);
  });
});

describe("parse_take", () => {
  it("usa default si no se pasa valor", () => {
    expect(parse_take(null)).toBe(30);
    expect(parse_take(undefined)).toBe(30);
    expect(parse_take("")).toBe(30);
  });

  it("respeta valores válidos dentro del rango", () => {
    expect(parse_take("10")).toBe(10);
  });

  it("clampa al máximo configurado", () => {
    expect(parse_take("9999")).toBe(50);
    expect(parse_take("12", { max: 5 })).toBe(5);
  });

  it("rechaza valores 0 / negativos / no numéricos cayendo al default", () => {
    expect(parse_take("0")).toBe(30);
    expect(parse_take("-5")).toBe(30);
    expect(parse_take("abc", { default_value: 7 })).toBe(7);
  });
});

describe("clean_search_query", () => {
  it("devuelve '' para nulos/vacíos", () => {
    expect(clean_search_query(null)).toBe("");
    expect(clean_search_query("   ")).toBe("");
  });

  it("recorta espacios externos", () => {
    expect(clean_search_query("  martillo  ")).toBe("martillo");
  });

  it("trunca a LIMITS.query (no lanza error, hace slice silencioso)", () => {
    const huge = "x".repeat(LIMITS.query + 100);
    const out = clean_search_query(huge);
    expect(out).toHaveLength(LIMITS.query);
  });
});

describe("is_movement_type", () => {
  it("acepta los 4 tipos en mayúsculas o minúsculas", () => {
    for (const t of ["IN", "OUT", "TRANSFER", "ADJUST"]) {
      expect(is_movement_type(t)).toBe(true);
      expect(is_movement_type(t.toLowerCase())).toBe(true);
    }
  });

  it("rechaza tipos desconocidos y no-strings", () => {
    expect(is_movement_type("FOO")).toBe(false);
    expect(is_movement_type("")).toBe(false);
    expect(is_movement_type(null)).toBe(false);
    expect(is_movement_type(undefined)).toBe(false);
    expect(is_movement_type(123)).toBe(false);
  });
});

describe("parse_movement_lines", () => {
  const base = { itemId: "item-1", quantity: 3, toLocationId: "loc-a" };

  it("rechaza array vacío", () => {
    expect(() => parse_movement_lines([], "IN")).toThrow(/al menos una línea/);
  });

  it("rechaza si no es array", () => {
    expect(() => parse_movement_lines(null, "IN")).toThrow(/al menos una línea/);
    expect(() => parse_movement_lines("foo", "IN")).toThrow(/al menos una línea/);
  });

  it("rechaza si excede LIMITS.lines", () => {
    const big = Array.from({ length: LIMITS.lines + 1 }, () => ({ ...base }));
    expect(() => parse_movement_lines(big, "IN")).toThrow(/Demasiadas líneas/);
  });

  it("rechaza líneas sin itemId", () => {
    expect(() =>
      parse_movement_lines([{ ...base, itemId: "" }], "IN"),
    ).toThrow(/itemId/);
    expect(() =>
      parse_movement_lines([{ ...base, itemId: "   " }], "IN"),
    ).toThrow(/itemId/);
  });

  it("rechaza cantidad no numérica", () => {
    expect(() =>
      parse_movement_lines([{ ...base, quantity: "abc" }], "IN"),
    ).toThrow(/Cantidad numérica/);
  });

  it("rechaza cantidad ≤ 0 para tipos distintos de ADJUST", () => {
    for (const type of ["IN", "OUT", "TRANSFER"]) {
      expect(() =>
        parse_movement_lines([{ ...base, quantity: 0 }], type),
      ).toThrow(/mayor que cero/);
      expect(() =>
        parse_movement_lines([{ ...base, quantity: -1 }], type),
      ).toThrow(/mayor que cero/);
    }
  });

  it("permite cantidad negativa o cero solo en ADJUST (cero se rechaza luego en applyMovementTx)", () => {
    const out = parse_movement_lines(
      [{ itemId: "item-1", quantity: -2, fromLocationId: "loc-a" }],
      "ADJUST",
    );
    expect(out[0].quantity).toBe(-2);
  });

  it("normaliza los strings y convierte vacíos a null", () => {
    const out = parse_movement_lines(
      [
        {
          itemId: "  item-1  ",
          quantity: 4,
          fromLocationId: "  loc-a  ",
          toLocationId: "",
        },
      ],
      "OUT",
    );
    expect(out[0]).toEqual({
      itemId: "item-1",
      quantity: 4,
      fromLocationId: "loc-a",
      toLocationId: null,
    });
  });

  it("trunca decimales en quantity con parseInt", () => {
    const out = parse_movement_lines([{ ...base, quantity: 3.9 }], "IN");
    expect(out[0].quantity).toBe(3);
  });
});

describe("validation_error", () => {
  it("hereda de Error y expone code/field", () => {
    const e = new validation_error("oops", { code: "X", field: "f" });
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(validation_error);
    expect(e.code).toBe("X");
    expect(e.field).toBe("f");
    expect(e.message).toBe("oops");
    expect(e.name).toBe("validation_error");
  });

  it("code por defecto es VALIDATION", () => {
    expect(new validation_error("oops").code).toBe("VALIDATION");
  });
});
