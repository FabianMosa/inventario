import { describe, it, expect } from "vitest";
import { clean_string } from "@/lib/validation";

/**
 * Pruebas para el filtro ?categoryId= en GET /api/items.
 *
 * La lógica en app/api/items/route.js usa clean_string() para sanitizar el
 * query param y luego lo inyecta en el where de Prisma solo si es truthy.
 * Estas pruebas validan ese comportamiento sin mockear Prisma.
 */
describe("GET /api/items ?categoryId filter", () => {
  it("clean_string devuelve null para categoryId vacío (no aplica filtro)", () => {
    expect(clean_string("", 64, "categoryId")).toBeNull();
    expect(clean_string(null, 64, "categoryId")).toBeNull();
    expect(clean_string(undefined, 64, "categoryId")).toBeNull();
    expect(clean_string("   ", 64, "categoryId")).toBeNull();
  });

  it("clean_string sanitiza un categoryId válido", () => {
    const id = "cm7xj8abc0001";
    expect(clean_string(id, 64, "categoryId")).toBe(id);
  });

  it("clean_string recorta espacios de categoryId", () => {
    expect(clean_string("   valid-id   ", 64, "categoryId")).toBe("valid-id");
  });

  it("clean_string lanza validation_error si categoryId excede 64 caracteres", () => {
    const long = "a".repeat(65);
    expect(() => clean_string(long, 64, "categoryId")).toThrow(/categoryId/);
  });

  it("la ausencia de categoryId produce null (no filter)", () => {
    // Simula el comportamiento del route: si searchParams.get("categoryId") es null
    const raw = null;
    const result = clean_string(raw, 64, "categoryId");
    expect(result).toBeNull();
  });

  it("truthy check: categoryId no nulo pasa el filtro", () => {
    // El route hace ...(category_id ? { categoryId: category_id } : {})
    // Validamos que un id válido es truthy
    const category_id = clean_string("cat-123", 64, "categoryId");
    expect(category_id).toBeTruthy();
    const where_has_filter = category_id ? { categoryId: category_id } : {};
    expect(where_has_filter).toEqual({ categoryId: "cat-123" });
  });

  it("falsy check: categoryId nulo omite el filtro", () => {
    const category_id = clean_string("", 64, "categoryId");
    expect(category_id).toBeFalsy();
    const where_has_no_filter = category_id ? { categoryId: category_id } : {};
    expect(where_has_no_filter).toEqual({});
  });
});
