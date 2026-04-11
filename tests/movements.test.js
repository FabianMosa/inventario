import { describe, it, expect } from "vitest";
import { applyMovementTx } from "@/lib/movements";
import { createMemoryStockTx } from "./helpers/memory-stock-tx.js";

const item = "item-1";
const locA = "loc-a";
const locB = "loc-b";

describe("applyMovementTx", () => {
  it("IN: suma en destino y crea fila si no existía", async () => {
    const { stockBalance, snapshotBalances } = createMemoryStockTx();
    await applyMovementTx({ stockBalance }, {
      type: "IN",
      lines: [{ itemId: item, quantity: 5, toLocationId: locA }],
    });
    const rows = snapshotBalances();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ itemId: item, locationId: locA, quantity: 5 });
  });

  it("IN: falla sin toLocationId", async () => {
    const { stockBalance } = createMemoryStockTx();
    await expect(
      applyMovementTx({ stockBalance }, {
        type: "IN",
        lines: [{ itemId: item, quantity: 1 }],
      }),
    ).rejects.toThrow(/IN requiere toLocationId/);
  });

  it("OUT: resta y falla si no hay stock", async () => {
    const { stockBalance } = createMemoryStockTx([
      { itemId: item, locationId: locA, quantity: 3 },
    ]);
    await expect(
      applyMovementTx({ stockBalance }, {
        type: "OUT",
        lines: [{ itemId: item, quantity: 5, fromLocationId: locA }],
      }),
    ).rejects.toThrow(/Stock insuficiente/);
  });

  it("OUT: resta correctamente", async () => {
    const { stockBalance, snapshotBalances } = createMemoryStockTx([
      { itemId: item, locationId: locA, quantity: 10 },
    ]);
    await applyMovementTx({ stockBalance }, {
      type: "OUT",
      lines: [{ itemId: item, quantity: 4, fromLocationId: locA }],
    });
    expect(snapshotBalances()[0].quantity).toBe(6);
  });

  it("TRANSFER: mueve entre ubicaciones distintas", async () => {
    const { stockBalance, snapshotBalances } = createMemoryStockTx([
      { itemId: item, locationId: locA, quantity: 10 },
    ]);
    await applyMovementTx({ stockBalance }, {
      type: "TRANSFER",
      lines: [{ itemId: item, quantity: 3, fromLocationId: locA, toLocationId: locB }],
    });
    const byLoc = Object.fromEntries(
      snapshotBalances().map((r) => [r.locationId, r.quantity]),
    );
    expect(byLoc[locA]).toBe(7);
    expect(byLoc[locB]).toBe(3);
  });

  it("TRANSFER: rechaza mismo origen y destino", async () => {
    const { stockBalance } = createMemoryStockTx([
      { itemId: item, locationId: locA, quantity: 5 },
    ]);
    await expect(
      applyMovementTx({ stockBalance }, {
        type: "TRANSFER",
        lines: [{
          itemId: item,
          quantity: 1,
          fromLocationId: locA,
          toLocationId: locA,
        }],
      }),
    ).rejects.toThrow(/origen y destino deben ser distintos/);
  });

  it("ADJUST: positivo suma en la ubicación", async () => {
    const { stockBalance, snapshotBalances } = createMemoryStockTx([
      { itemId: item, locationId: locA, quantity: 2 },
    ]);
    await applyMovementTx({ stockBalance }, {
      type: "ADJUST",
      lines: [{ itemId: item, quantity: 4, fromLocationId: locA }],
    });
    expect(snapshotBalances()[0].quantity).toBe(6);
  });

  it("ADJUST: negativo resta con validación de stock", async () => {
    const { stockBalance, snapshotBalances } = createMemoryStockTx([
      { itemId: item, locationId: locA, quantity: 5 },
    ]);
    await applyMovementTx({ stockBalance }, {
      type: "ADJUST",
      lines: [{ itemId: item, quantity: -2, fromLocationId: locA }],
    });
    expect(snapshotBalances()[0].quantity).toBe(3);
  });

  it("ADJUST: rechaza cantidad 0", async () => {
    const { stockBalance } = createMemoryStockTx([
      { itemId: item, locationId: locA, quantity: 1 },
    ]);
    await expect(
      applyMovementTx({ stockBalance }, {
        type: "ADJUST",
        lines: [{ itemId: item, quantity: 0, fromLocationId: locA }],
      }),
    ).rejects.toThrow(/no puede ser 0/);
  });

  it("tipo desconocido lanza error explícito", async () => {
    const { stockBalance } = createMemoryStockTx();
    await expect(
      applyMovementTx({ stockBalance }, {
        type: "INVALID",
        lines: [{ itemId: item, quantity: 1, toLocationId: locA }],
      }),
    ).rejects.toThrow(/no soportado/);
  });
});
