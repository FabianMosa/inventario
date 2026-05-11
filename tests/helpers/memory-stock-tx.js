/**
 * Cliente Prisma falso en memoria solo para `stockBalance` 
 * (findUnique/update/create/upsert/updateMany).
 * Permite probar `applyMovementTx` sin PostgreSQL.
 *
 * @param {Array<{ id?: string; itemId: string; locationId: string; quantity: number }>} initial
 */
export function createMemoryStockTx(initial = []) {
  /** @type Map<string, { id: string; itemId: string; locationId: string; quantity: number }> */
  const byKey = new Map();
  let idSeq = 1;

  const compositeKey = (itemId, locationId) => `${itemId}|${locationId}`;

  for (const row of initial) {
    const k = compositeKey(row.itemId, row.locationId);
    byKey.set(k, {
      id: row.id ?? `bal-${idSeq++}`,
      itemId: row.itemId,
      locationId: row.locationId,
      quantity: row.quantity,
    });
  }

  const stockBalance = {
    findUnique: async ({ where: { itemId_locationId: { itemId, locationId } } }) => {
      return byKey.get(compositeKey(itemId, locationId)) ?? null;
    },
    update: async ({ where: { id }, data: { quantity } }) => {
      for (const row of byKey.values()) {
        if (row.id === id) {
          row.quantity = quantity;
          return { ...row };
        }
      }
      throw new Error(`StockBalance no encontrado: ${id}`);
    },
    create: async ({ data: { itemId, locationId, quantity } }) => {
      const row = {
        id: `bal-${idSeq++}`,
        itemId,
        locationId,
        quantity,
      };
      byKey.set(compositeKey(itemId, locationId), row);
      return { ...row };
    },
    /** upsert atómico: crea o actualiza el saldo */
    upsert: async ({ where: { itemId_locationId: { itemId, locationId } }, update, create }) => {
      const k = compositeKey(itemId, locationId);
      const existing = byKey.get(k);
      if (existing) {
        // update: acumula el delta
        const delta = update.quantity.increment;
        existing.quantity += delta;
        return { ...existing };
      }
      // create
      const row = {
        id: `bal-${idSeq++}`,
        itemId,
        locationId,
        quantity: create.quantity,
      };
      byKey.set(k, row);
      return { ...row };
    },
    /** updateMany: descuenta solo si hay stock suficiente */
    updateMany: async ({ where: { itemId, locationId, quantity }, data }) => {
      const k = compositeKey(itemId, locationId);
      const existing = byKey.get(k);
      if (existing && existing.quantity >= quantity.gte) {
        existing.quantity -= data.quantity.decrement;
        return { count: 1 };
      }
      return { count: 0 };
    },
  };

  return {
    stockBalance,
    /** Copia de saldos actuales para aserciones */
    snapshotBalances() {
      return [...byKey.values()].map((r) => ({ ...r }));
    },
  };
}
