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
 * Usa upsert atómico para evitar race conditions.
 */
async function adjustBalance(tx, itemId, locationId, delta) {
  await tx.stockBalance.upsert({
    where: { itemId_locationId: { itemId, locationId } },
    update: { quantity: { increment: delta } },
    create: { itemId, locationId, quantity: delta },
  });
}

/**
 * Resta cantidad comprobando que no quede negativo.
 * Usa updateMany con filtro quantity >= qty para que la validación
 * y la resta sean atómicas — sin race condition entre lectura y escritura.
 */
async function ensureAndSubtract(tx, itemId, locationId, qty) {
  const result = await tx.stockBalance.updateMany({
    where: { itemId, locationId, quantity: { gte: qty } },
    data: { quantity: { decrement: qty } },
  });

  if (result.count === 0) {
    // No se afectó ninguna fila: puede ser que no exista el balance
    // o que el stock sea insuficiente. Averiguamos cuál para dar un
    // mensaje preciso.
    const existing = await tx.stockBalance.findUnique({
      where: { itemId_locationId: { itemId, locationId } },
    });
    const current = existing?.quantity ?? 0;
    throw new Error(
      `Stock insuficiente para artículo ${itemId} en ubicación ${locationId} (disponible: ${current}, solicitado: ${qty})`
    );
  }
}
