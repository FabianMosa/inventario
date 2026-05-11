import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

/**
 * Etiqueta imprimible de artículo con nombre, SKU, código de barras y QR.
 * Diseñada para impresión: sin navegación, sin sombras, sin blur.
 */
export default async function ItemLabelPage({ params }) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id },
  });
  if (!item) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const itemUrl = `${baseUrl}/items/${item.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(itemUrl)}`;

  return (
    <div className="label-container">
      <div className="label-card">
        {/* QR code */}
        <div className="label-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="QR del artículo"
            width={180}
            height={180}
          />
        </div>

        {/* Datos */}
        <div className="label-data">
          <h1 className="label-name">{item.name}</h1>
          <p className="label-sku">SKU: {item.sku}</p>

          {item.barcode ? (
            <p className="label-barcode">
              <span className="label-muted">Código:</span>{" "}
              <span className="label-code">{item.barcode}</span>
            </p>
          ) : null}

          {item.description ? (
            <p className="label-desc">{item.description}</p>
          ) : null}
        </div>
      </div>

      <p className="label-hint">
        <Link href={`/items/${item.id}`}>← Volver al detalle</Link>
        {" · "}
        <PrintButton />
      </p>

      <style>{`
        .label-container {
          max-width: 480px;
          margin: 2rem auto;
          padding: 0 1rem;
        }
        .label-card {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          padding: 1.5rem;
          background: #fff;
        }
        .label-qr img {
          display: block;
          border-radius: 0.5rem;
        }
        .label-data {
          flex: 1;
          min-width: 0;
        }
        .label-name {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.25rem;
          line-height: 1.3;
        }
        .label-sku {
          font-family: monospace;
          font-size: 0.875rem;
          color: #475569;
          margin: 0 0 0.5rem;
        }
        .label-barcode {
          font-size: 0.875rem;
          margin: 0 0 0.25rem;
          color: #1e293b;
        }
        .label-muted {
          color: #64748b;
        }
        .label-code {
          font-family: monospace;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 0.05em;
          color: #0f172a;
        }
        .label-desc {
          font-size: 0.8125rem;
          color: #64748b;
          margin: 0.25rem 0 0;
        }
        .label-hint {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: #64748b;
        }
        .label-hint a {
          color: #4f46e5;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        @media print {
          body {
            background: #fff !important;
          }
          .label-hint {
            display: none !important;
          }
          .label-card {
            border: 1px solid #ccc;
            box-shadow: none;
            page-break-inside: avoid;
            margin: 0 auto;
            max-width: 400px;
          }
        }
      `}</style>
    </div>
  );
}
