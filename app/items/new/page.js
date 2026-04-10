import { ItemForm } from "@/components/ItemForm";
import { PageHeader } from "@/components/PageHeader";

export default function NewItemPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Nuevo artículo"
        description="El stock se actualiza solo mediante movimientos de inventario."
      />
      <ItemForm mode="new" />
    </div>
  );
}
