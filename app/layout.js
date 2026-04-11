import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { DemoReadonlyBanner } from "@/components/DemoReadonlyBanner";
import { Nav } from "@/components/Nav";

// Evita prerender estático que ejecutaría Prisma sin DATABASE_URL en el build (CI/Railway)
export const dynamic = "force-dynamic";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Inventario — Stock claro en un vistazo | Demo portafolio",
  description:
    "Explora un inventario real sin login: catálogo con SKU, ubicaciones, movimientos (entrada, salida, transferencia, ajuste) y alertas de stock mínimo. Next.js 15 y PostgreSQL.",
};

/** Layout raíz: tipografía moderna, navegación fija y contenedor responsive */
export default function RootLayout({ children }) {
  return (
    <html lang="es" className={fontSans.variable}>
      <body className={`${fontSans.className} pb-16 font-sans`}>
        <DemoReadonlyBanner />
        <Nav />
        <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
