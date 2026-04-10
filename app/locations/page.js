import { LocationsClient } from "@/components/LocationsClient";
import { PageHeader } from "@/components/PageHeader";

export default function LocationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Ubicaciones"
        description="Almacenes o puntos de stock"
      />
      <LocationsClient />
    </div>
  );
}
