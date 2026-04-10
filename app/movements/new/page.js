import { MovementForm } from "@/components/MovementForm";
import { PageHeader } from "@/components/PageHeader";

export default function NewMovementPage() {
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
