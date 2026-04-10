import { CategoriesClient } from "@/components/CategoriesClient";
import { PageHeader } from "@/components/PageHeader";

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Categorías"
        description="Clasificación de artículos en el catálogo"
      />
      <CategoriesClient />
    </div>
  );
}
