import { CategoriesClient } from "@/components/CategoriesClient";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";

/** Página de categorías con carga inicial en servidor para evitar fetch-on-mount cliente. */
export default async function CategoriesPage() {
  const initial_rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Categorías"
        description="Clasificación de artículos en el catálogo"
      />
      <CategoriesClient initial_rows={initial_rows} />
    </div>
  );
}
