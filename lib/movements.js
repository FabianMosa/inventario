/**
 * Aplica un movimiento de inventario dentro de una transacción Prisma.
 * Actualiza (o crea) filas en StockBalance según el tipo de cada línea.
 *
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {{ type: keyof typeof MovementType; lines: Array<{
 *   itemId: string;
 *   quantity: number;
 *   fromLocationId?: string | null;
 *   toLocationId?: string | null;
 * }> }} payload
 */
export async function applyMovementTx(tx, payload) {
  const { type, lines } = payload;

  for (const line of lines) {
    const { itemId, quantity, fromLocationId, toLocationId } = line;

    switch (type) {
      case "IN": {
        if (!toLocationId) throw new Error("IN requiere toLocationId");
        if (quantity <= 0) throw new Error("IN requiere cantidad > 0");
        await adjustBalance(tx, itemId, toLocationId, quantity);
        break;
      }
      case "OUT": {
        if (!fromLocationId) throw new Error("OUT requiere fromLocationId");
        if (quantity <= 0) throw new Error("OUT requiere cantidad > 0");
        await ensureAndSubtract(tx, itemId, fromLocationId, quantity);
        break;
      }
      case "TRANSFER": {
        if (!fromLocationId || !toLocationId)
          throw new Error("TRANSFER requiere fromLocationId y toLocationId");
        if (fromLocationId === toLocationId)
          throw new Error("TRANSFER: origen y destino deben ser distintos");
        if (quantity <= 0) throw new Error("TRANSFER requiere cantidad > 0");
        await ensureAndSubtract(tx, itemId, fromLocationId, quantity);
        await adjustBalance(tx, itemId, toLocationId, quantity);
        break;
      }
      case "ADJUST": {
        if (!fromLocationId) throw new Error("ADJUST requiere ubicación (fromLocationId)");
        if (quantity === 0) throw new Error("ADJUST: cantidad no puede ser 0");
        if (quantity < 0) {
          await ensureAndSubtract(tx, itemId, fromLocationId, -quantity);
        } else {
          await adjustBalance(tx, itemId, fromLocationId, quantity);
        }
        break;
      }
      default:
        throw new Error(`Tipo de movimiento no soportado: ${type}`);
    }
  }
}

/**
 * Suma cantidad al saldo (crea balance si no existe).
 */
async function adjustBalance(tx, itemId, locationId, delta) {
  const existing = await tx.stockBalance.findUnique({
    where: { itemId_locationId: { itemId, locationId } },
  });
  if (existing) {
    await tx.stockBalance.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + delta },
    });
  } else {
    await tx.stockBalance.create({
      data: { itemId, locationId, quantity: delta },
    });
  }
}

/**
 * Resta cantidad comprobando que no quede negativo.
 */
async function ensureAndSubtract(tx, itemId, locationId, qty) {
  const existing = await tx.stockBalance.findUnique({
    where: { itemId_locationId: { itemId, locationId } },
  });
  const current = existing?.quantity ?? 0;
  if (current < qty) {
    throw new Error(
      `Stock insuficiente para artículo ${itemId} en ubicación ${locationId} (disponible: ${current}, solicitado: ${qty})`
    );
  }
  if (existing) {
    await tx.stockBalance.update({
      where: { id: existing.id },
      data: { quantity: current - qty },
    });
  }
}
