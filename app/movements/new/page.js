import { redirect } from "next/navigation";
import { MovementForm } from "@/components/MovementForm";
import { PageHeader } from "@/components/PageHeader";
import { isDemoReadonly } from "@/lib/demo";

export default function NewMovementPage() {
  if (isDemoReadonly()) redirect("/movements");
  return (
    <div className="space-y-8">
      <PageHeader
        title="Nuevo movimiento"
        description="Entrada, salida, transferencia o ajuste. Una línea por envío (demo)."
      />
      <MovementForm />
    </div>
  );
}
