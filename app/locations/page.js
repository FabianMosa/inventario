import { LocationsClient } from "@/components/LocationsClient";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";

/** Página de ubicaciones con carga inicial en servidor para evitar fetch-on-mount cliente. */
export default async function LocationsPage() {
  const initial_rows = await prisma.location.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ubicaciones"
        description="Almacenes o puntos de stock"
      />
      <LocationsClient initial_rows={initial_rows} />
    </div>
  );
}
