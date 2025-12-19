import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// 🚀 ESTO ES LO QUE ARREGLA EL ERROR DE VERCEL
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ orderId: string; slug: string }>;
}

export default async function PrintOrderPage({ params }: Props) {
  // En Next.js 15, los params deben ser esperados (awaited)
  const resolvedParams = await params;
  const { orderId } = resolvedParams;

  const order = await db.workOrder.findUnique({
    where: { id: orderId },
    include: {
      vehicle: { include: { customer: true } },
      items: true,
      tenant: true,
    },
  });

  if (!order) return notFound();

  // 🛡️ Evitamos errores de "null" si el cliente o vehículo no existen
  const customer = order.vehicle?.customer;
  const vehicle = order.vehicle;

  return (
    <div className="p-8 bg-white text-black min-h-screen font-sans">
      {/* Script para imprimir automáticamente al cargar */}
      <script dangerouslySetInnerHTML={{ __html: "window.print()" }} />

      {/* ENCABEZADO */}
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            {order.tenant?.name || "NEXUS GARAGE"}
          </h1>
          <p className="text-sm font-bold text-gray-600 uppercase">Orden de Trabajo #{order.number}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase font-bold text-gray-500">Fecha de Emisión</p>
          <p className="font-medium">
            {order.createdAt ? format(new Date(order.createdAt), "PPP", { locale: es }) : "S/F"}
          </p>
        </div>
      </div>

      {/* INFORMACIÓN DE CONTACTO */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Cliente</h3>
          <p className="text-lg font-bold uppercase">{customer?.firstName} {customer?.lastName}</p>
          <p className="text-sm">{customer?.phone || "Sin teléfono"}</p>
          <p className="text-sm text-gray-600">{customer?.email}</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Vehículo</h3>
          <p className="text-lg font-bold uppercase">{vehicle?.brand} {vehicle?.model}</p>
          <p className="inline-block px-2 py-1 bg-black text-white font-mono text-sm font-bold rounded mt-1">
            PATENTE: {vehicle?.plateOrSerial}
          </p>
        </div>
      </div>

      {/* TABLA DE SERVICIOS */}
      <div className="mb-10">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-black text-left text-xs uppercase font-bold text-gray-600">
              <th className="pb-3">Descripción del Servicio / Repuesto</th>
              <th className="pb-3 text-center w-24">Cant.</th>
              <th className="pb-3 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <tr key={item.id} className="text-sm">
                <td className="py-4 font-medium">{item.description}</td>
                <td className="py-4 text-center">{item.quantity}</td>
                <td className="py-4 text-right font-bold">${item.price.toLocaleString("es-CL")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTALES */}
      <div className="flex justify-end pt-6 border-t-2 border-black">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Neto:</span>
            <span>${Math.round(order.totalAmount / 1.19).toLocaleString("es-CL")}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>IVA (19%):</span>
            <span>${Math.round(order.totalAmount - (order.totalAmount / 1.19)).toLocaleString("es-CL")}</span>
          </div>
          <div className="flex justify-between text-2xl font-black bg-black text-white p-2">
            <span>TOTAL:</span>
            <span>${order.totalAmount.toLocaleString("es-CL")}</span>
          </div>
        </div>
      </div>

      {/* PIE DE PÁGINA */}
      <div className="mt-20 text-center border-t border-dashed pt-10">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
          Documento generado por Nexus Garage OS — Gestión Profesional de Talleres
        </p>
      </div>
    </div>
  );
}