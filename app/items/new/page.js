import { redirect } from "next/navigation";
import { ItemForm } from "@/components/ItemForm";
import { PageHeader } from "@/components/PageHeader";
import { isDemoReadonly } from "@/lib/demo";

export default function NewItemPage() {
  if (isDemoReadonly()) redirect("/items");
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
