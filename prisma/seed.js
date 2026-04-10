/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Datos de demostración en español para portafolio (sin autenticación).
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

  const item1 = await prisma.item.upsert({
    where: { sku: "SKU-DEMO-001" },
    update: {},
    create: {
      sku: "SKU-DEMO-001",
      name: "Hub USB-C 4 puertos",
      description: "Demostración de artículo con stock mínimo",
      unit: "u",
      minStock: 5,
      maxStock: 100,
      categoryId: catElectr.id,
    },
  });

  const item2 = await prisma.item.upsert({
    where: { sku: "SKU-DEMO-002" },
    update: {},
    create: {
      sku: "SKU-DEMO-002",
      name: "Cuaderno A4",
      unit: "paq",
      minStock: 10,
      categoryId: catOfi.id,
    },
  });

  // Saldos iniciales (sin pasar por movimiento para simplificar seed)
  await prisma.stockBalance.upsert({
    where: {
      itemId_locationId: { itemId: item1.id, locationId: locCd.id },
    },
    update: { quantity: 12 },
    create: { itemId: item1.id, locationId: locCd.id, quantity: 12 },
  });

  await prisma.stockBalance.upsert({
    where: {
      itemId_locationId: { itemId: item1.id, locationId: locTienda.id },
    },
    update: { quantity: 3 },
    create: { itemId: item1.id, locationId: locTienda.id, quantity: 3 },
  });

  await prisma.stockBalance.upsert({
    where: {
      itemId_locationId: { itemId: item2.id, locationId: locCd.id },
    },
    update: { quantity: 8 },
    create: { itemId: item2.id, locationId: locCd.id, quantity: 8 },
  });

  console.log("Seed completado:", { catElectr, locCd, item1, item2 });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
