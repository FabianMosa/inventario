/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * SKUs controlados por este seed: al re-ejecutar se borran solo sus movimientos y saldos
 * (luego se recrean coherentes). Artículos ajenos a la lista no se tocan.
 */
const SEED_SKUS = [
  "SKU-DEMO-001",
  "SKU-DEMO-002",
  "SKU-DEMO-003",
  "SKU-DEMO-004",
  "SKU-DEMO-005",
  "SKU-DEMO-006",
  "SKU-DEMO-007",
  "SKU-DEMO-008",
  "SKU-DEMO-009",
  "SKU-DEMO-010",
];

/**
 * Replica la lógica de lib/movements.js para que el seed no dependa de ESM en Node.
 * Si cambian las reglas de stock, mantener ambos archivos alineados.
 */
async function applyMovementTx(tx, payload) {
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
        if (!fromLocationId)
          throw new Error("ADJUST requiere ubicación (fromLocationId)");
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

async function adjustBalance(tx, itemId, locationId, delta) {
  await tx.stockBalance.upsert({
    where: { itemId_locationId: { itemId, locationId } },
    update: { quantity: { increment: delta } },
    create: { itemId, locationId, quantity: delta },
  });
}

async function ensureAndSubtract(tx, itemId, locationId, qty) {
  const result = await tx.stockBalance.updateMany({
    where: { itemId, locationId, quantity: { gte: qty } },
    data: { quantity: { decrement: qty } },
  });

  if (result.count === 0) {
    const existing = await tx.stockBalance.findUnique({
      where: { itemId_locationId: { itemId, locationId } },
    });
    const current = existing?.quantity ?? 0;
    throw new Error(
      `Stock insuficiente para artículo ${itemId} en ubicación ${locationId} (disponible: ${current}, solicitado: ${qty})`
    );
  }
}

/**
 * Crea cabecera, líneas y aplica saldos. Usa el cliente global (no `$transaction`
 * interactiva) para evitar P2028 en conexiones lentas o serverless; el seed es
 * idempotente vía `resetSeedInventory`.
 */
async function createMovement(db, { type, reference, notes, lines }) {
  const m = await db.movement.create({
    data: {
      type,
      reference: reference ?? null,
      notes: notes ?? null,
    },
  });
  for (const line of lines) {
    await db.movementLine.create({
      data: {
        movementId: m.id,
        itemId: line.itemId,
        quantity: line.quantity,
        fromLocationId: line.fromLocationId ?? null,
        toLocationId: line.toLocationId ?? null,
      },
    });
  }
  await applyMovementTx(db, { type, lines });
}

/** Elimina líneas, movimientos y saldos solo de artículos seed (idempotente). */
async function resetSeedInventory() {
  const seedItems = await prisma.item.findMany({
    where: { sku: { in: SEED_SKUS } },
    select: { id: true },
  });
  const seedItemIds = seedItems.map((i) => i.id);
  if (!seedItemIds.length) return;

  const lineRefs = await prisma.movementLine.findMany({
    where: { itemId: { in: seedItemIds } },
    select: { movementId: true },
    distinct: ["movementId"],
  });
  const movementIds = lineRefs.map((r) => r.movementId);

  await prisma.movementLine.deleteMany({
    where: { itemId: { in: seedItemIds } },
  });
  if (movementIds.length) {
    await prisma.movement.deleteMany({ where: { id: { in: movementIds } } });
  }
  await prisma.stockBalance.deleteMany({
    where: { itemId: { in: seedItemIds } },
  });
}

/**
 * Datos de demostración en español: maestros, artículos y movimientos que generan
 * historial y saldos coherentes (mejor visualización en listados y detalle).
 */
async function main() {
  const catElectr = await prisma.category.upsert({
    where: { id: "seed-cat-elect" },
    update: {},
    create: { id: "seed-cat-elect", name: "Electrónica" },
  });

  const catOfi = await prisma.category.upsert({
    where: { id: "seed-cat-ofi" },
    update: {},
    create: { id: "seed-cat-ofi", name: "Oficina" },
  });

  const catFerre = await prisma.category.upsert({
    where: { id: "seed-cat-ferre" },
    update: {},
    create: { id: "seed-cat-ferre", name: "Ferretería" },
  });

  const catEmb = await prisma.category.upsert({
    where: { id: "seed-cat-emb" },
    update: {},
    create: { id: "seed-cat-emb", name: "Embalaje" },
  });

  const catCons = await prisma.category.upsert({
    where: { id: "seed-cat-cons" },
    update: {},
    create: { id: "seed-cat-cons", name: "Consumibles" },
  });

  const locCd = await prisma.location.upsert({
    where: { id: "seed-loc-cd" },
    update: {},
    create: { id: "seed-loc-cd", name: "Centro de distribución", code: "CD-01" },
  });

  const locTienda = await prisma.location.upsert({
    where: { id: "seed-loc-tienda" },
    update: {},
    create: { id: "seed-loc-tienda", name: "Tienda centro", code: "TN-01" },
  });

  const locBs = await prisma.location.upsert({
    where: { id: "seed-loc-bs" },
    update: {},
    create: { id: "seed-loc-bs", name: "Bodega sur", code: "BD-02" },
  });

  const locMost = await prisma.location.upsert({
    where: { id: "seed-loc-most" },
    update: {},
    create: { id: "seed-loc-most", name: "Mostrador", code: "MO-01" },
  });

  await resetSeedInventory();

  const itemDefs = [
    {
      sku: "SKU-DEMO-001",
      name: "Hub USB-C 4 puertos",
      description: "Concentrador compacto para portátiles",
      unit: "u",
      minStock: 60,
      maxStock: 200,
      categoryId: catElectr.id,
      barcode: "7791234560011",
      imageUrl: "https://picsum.photos/seed/hub/400/400",
    },
    {
      sku: "SKU-DEMO-002",
      name: "Cuaderno A4 (80 hojas)",
      description: "Tapa blanda, rayado",
      unit: "paq",
      minStock: 15,
      maxStock: 500,
      categoryId: catOfi.id,
      barcode: "7791234560028",
      imageUrl: "https://picsum.photos/seed/cuaderno/400/400",
    },
    {
      sku: "SKU-DEMO-003",
      name: "Cable USB-C 2 m",
      description: "Carga rápida 60 W",
      unit: "u",
      minStock: 40,
      categoryId: catElectr.id,
      barcode: "7791234560035",
      imageUrl: "https://picsum.photos/seed/cable/400/400",
    },
    {
      sku: "SKU-DEMO-004",
      name: "Teclado mecánico",
      description: "Switches brown, layout ES",
      unit: "u",
      minStock: 5,
      maxStock: 40,
      categoryId: catElectr.id,
      barcode: "7791234560042",
      imageUrl: "https://picsum.photos/seed/teclado/400/400",
    },
    {
      sku: "SKU-DEMO-005",
      name: "Mouse inalámbrico",
      description: "Sensor óptico, silencioso",
      unit: "u",
      minStock: 12,
      categoryId: catElectr.id,
      barcode: "7791234560059",
      imageUrl: "https://picsum.photos/seed/mouse/400/400",
    },
    {
      sku: "SKU-DEMO-006",
      name: "Cinta de embalaje",
      description: "Transparente 48 mm × 100 m",
      unit: "rollo",
      minStock: 30,
      categoryId: catEmb.id,
      barcode: "7791234560066",
      imageUrl: "https://picsum.photos/seed/cinta/400/400",
    },
    {
      sku: "SKU-DEMO-007",
      name: "Caja de cartón (lote 20)",
      description: "Tamaño mediano para envíos",
      unit: "lote",
      minStock: 8,
      categoryId: catEmb.id,
      barcode: "7791234560073",
      imageUrl: "https://picsum.photos/seed/caja/400/400",
    },
    {
      sku: "SKU-DEMO-008",
      name: "Tóner compatible",
      description: "Rendimiento aprox. 1.5k páginas",
      unit: "u",
      minStock: 4,
      categoryId: catCons.id,
      barcode: "7791234560080",
      imageUrl: "https://picsum.photos/seed/toner/400/400",
    },
    {
      sku: "SKU-DEMO-009",
      name: "Pilas AAA (paq 8)",
      description: "Alcalinas",
      unit: "paq",
      minStock: 25,
      categoryId: catCons.id,
      barcode: "7791234560097",
      imageUrl: "https://picsum.photos/seed/pilas/400/400",
    },
    {
      sku: "SKU-DEMO-010",
      name: "Kit destornilladores",
      description: "12 piezas magnéticas",
      unit: "kit",
      minStock: 6,
      categoryId: catFerre.id,
      barcode: "7791234560103",
      imageUrl: "https://picsum.photos/seed/destornillador/400/400",
    },
  ];

  const items = {};
  for (const def of itemDefs) {
    const row = await prisma.item.upsert({
      where: { sku: def.sku },
      update: {
        name: def.name,
        description: def.description,
        unit: def.unit,
        minStock: def.minStock,
        maxStock: def.maxStock ?? null,
        categoryId: def.categoryId,
        barcode: def.barcode ?? null,
        imageUrl: def.imageUrl ?? null,
        active: true,
      },
      create: {
        sku: def.sku,
        name: def.name,
        description: def.description,
        unit: def.unit,
        minStock: def.minStock,
        maxStock: def.maxStock ?? null,
        categoryId: def.categoryId,
        barcode: def.barcode ?? null,
        imageUrl: def.imageUrl ?? null,
      },
    });
    items[def.sku] = row;
  }

  const I = (sku) => items[sku].id;

  // Una transacción por documento evita timeouts en conexiones lentas (P2028).
  const movementSteps = [
    {
      type: "IN",
      reference: "REC-2401",
      notes: "Recepción inicial proveedor (demo)",
      lines: [
        { itemId: I("SKU-DEMO-001"), quantity: 40, toLocationId: locCd.id },
        { itemId: I("SKU-DEMO-002"), quantity: 80, toLocationId: locCd.id },
        { itemId: I("SKU-DEMO-003"), quantity: 120, toLocationId: locCd.id },
        { itemId: I("SKU-DEMO-004"), quantity: 20, toLocationId: locCd.id },
        { itemId: I("SKU-DEMO-005"), quantity: 30, toLocationId: locCd.id },
        { itemId: I("SKU-DEMO-006"), quantity: 150, toLocationId: locCd.id },
        { itemId: I("SKU-DEMO-007"), quantity: 100, toLocationId: locCd.id },
        { itemId: I("SKU-DEMO-008"), quantity: 15, toLocationId: locCd.id },
        { itemId: I("SKU-DEMO-009"), quantity: 60, toLocationId: locCd.id },
        { itemId: I("SKU-DEMO-010"), quantity: 25, toLocationId: locCd.id },
      ],
    },
    {
      type: "IN",
      reference: "REC-2402",
      notes: "Reposición tienda y mostrador",
      lines: [
        { itemId: I("SKU-DEMO-001"), quantity: 5, toLocationId: locTienda.id },
        { itemId: I("SKU-DEMO-005"), quantity: 10, toLocationId: locTienda.id },
        { itemId: I("SKU-DEMO-002"), quantity: 24, toLocationId: locMost.id },
      ],
    },
    {
      type: "IN",
      reference: "REC-2403",
      notes: "Stock en bodega sur",
      lines: [
        { itemId: I("SKU-DEMO-007"), quantity: 50, toLocationId: locBs.id },
        { itemId: I("SKU-DEMO-006"), quantity: 80, toLocationId: locBs.id },
      ],
    },
    {
      type: "TRANSFER",
      reference: "TRF-104",
      notes: "Traslado CD → tienda",
      lines: [
        {
          itemId: I("SKU-DEMO-001"),
          quantity: 8,
          fromLocationId: locCd.id,
          toLocationId: locTienda.id,
        },
      ],
    },
    {
      type: "TRANSFER",
      reference: "TRF-105",
      notes: "Cuadernos al mostrador",
      lines: [
        {
          itemId: I("SKU-DEMO-002"),
          quantity: 20,
          fromLocationId: locCd.id,
          toLocationId: locMost.id,
        },
      ],
    },
    {
      type: "OUT",
      reference: "VTA-8891",
      notes: "Salida por venta",
      lines: [
        {
          itemId: I("SKU-DEMO-003"),
          quantity: 25,
          fromLocationId: locCd.id,
        },
      ],
    },
    {
      type: "OUT",
      reference: "VTA-8892",
      notes: "Venta tienda",
      lines: [
        {
          itemId: I("SKU-DEMO-005"),
          quantity: 4,
          fromLocationId: locTienda.id,
        },
      ],
    },
    {
      type: "ADJUST",
      reference: "AJU-INV-01",
      notes: "Ajuste de inventario cíclico (faltante)",
      lines: [
        {
          itemId: I("SKU-DEMO-009"),
          quantity: -3,
          fromLocationId: locCd.id,
        },
      ],
    },
    {
      type: "TRANSFER",
      reference: "TRF-106",
      notes: "Devolución de tienda a CD",
      lines: [
        {
          itemId: I("SKU-DEMO-005"),
          quantity: 5,
          fromLocationId: locTienda.id,
          toLocationId: locCd.id,
        },
      ],
    },
  ];

  for (const step of movementSteps) {
    await createMovement(prisma, step);
  }

  console.log("Seed completado:", {
    categorias: 5,
    ubicaciones: 4,
    articulos: Object.keys(items).length,
    movimientos: "8 documentos (varias líneas)",
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
