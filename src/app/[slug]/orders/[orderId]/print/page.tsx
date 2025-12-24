import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ orderId: string; slug: string }>;
}

export default async function PrintOrderPage({ params }: Props) {
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

  const customer = order.vehicle?.customer;
  const vehicle = order.vehicle;
  const tenant = order.tenant; // Atajo para los datos del taller

  // ✅ CÁLCULO DE IVA DINÁMICO
  // Si el taller tiene configurada una tasa (ej: 0 para zona franca), la usa.
  // Si no, usa 19% por defecto.
  const taxRate = tenant?.taxRate ?? 19; 
  const taxFactor = 1 + (taxRate / 100);

  const neto = Math.round(order.totalAmount / taxFactor);
  const iva = order.totalAmount - neto;

  return (
    <div className="p-10 bg-white text-black min-h-screen font-sans max-w-[210mm] mx-auto">
      <PrintScript />

      {/* ENCABEZADO */}
      <div className="flex justify-between items-start border-b-4 border-black pb-6 mb-8">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-none mb-3">
            {tenant?.name || "NEXUS GARAGE"}
          </h1>

          {/* 🛠️ BLOQUE DE DATOS DEL TALLER */}
          <div className="text-sm font-medium text-gray-600 space-y-0.5 mb-4">
            {tenant?.address && (
                <p className="uppercase tracking-wide">{tenant.address}</p>
            )}
            <div className="flex items-center gap-3">
                {tenant?.phone && (
                    <span>📞 {tenant.phone}</span>
                )}
                {tenant?.email && (
                    <span>✉️ {tenant.email}</span>
                )}
            </div>
          </div>

          <p className="text-lg font-bold text-black uppercase mt-2 inline-block border-2 border-black px-2 py-1">
            Orden de Trabajo #{order.number}
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-xs uppercase font-bold text-gray-500 mb-1">Fecha de Emisión</p>
          <p className="font-medium text-lg">
            {order.createdAt ? format(new Date(order.createdAt), "PPP", { locale: es }) : "S/F"}
          </p>
        </div>
      </div>

      {/* DATOS DEL CLIENTE Y VEHÍCULO */}
      <div className="grid grid-cols-2 gap-12 mb-10 border border-gray-200 p-6 rounded-lg shadow-sm">
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mb-2">Cliente</h3>
          <p className="text-xl font-bold uppercase text-black">{customer?.firstName} {customer?.lastName}</p>
          <p className="text-sm text-gray-700 font-medium">📞 {customer?.phone || "Sin teléfono"}</p>
          <p className="text-sm text-gray-500">✉️ {customer?.email}</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1 mb-2">Vehículo</h3>
          <p className="text-xl font-bold uppercase text-black">{vehicle?.brand} {vehicle?.model}</p>
          
          {/* Etiqueta de Patente Forzada */}
          <div 
            className="inline-block px-3 py-1 font-mono text-sm font-bold rounded mt-1 border-2 border-black"
            style={{ 
              backgroundColor: "black", 
              color: "white", 
              WebkitPrintColorAdjust: "exact", 
              printColorAdjust: "exact" 
            }}
          >
            PATENTE: {vehicle?.plateOrSerial}
          </div>
        </div>
      </div>

      {/* TABLA DE ÍTEMS */}
      <div className="mb-10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-left text-xs uppercase font-bold text-gray-600">
              <th className="py-3 px-2">Descripción</th>
              <th className="py-3 px-2 text-center w-24">Cant.</th>
              <th className="py-3 px-2 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <tr key={item.id} className="text-sm">
                <td className="py-4 px-2 font-medium text-gray-800">{item.description}</td>
                <td className="py-4 px-2 text-center text-gray-600">{item.quantity}</td>
                <td className="py-4 px-2 text-right font-bold text-black">${item.price.toLocaleString("es-CL")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTALES */}
      <div className="flex justify-end pt-6 border-t-2 border-black">
        <table className="w-72 border-collapse">
          <tbody>
            <tr>
              <td className="text-sm text-gray-600 py-2 px-2 text-right">Neto:</td>
              <td className="text-sm text-right py-2 px-2 font-medium">${neto.toLocaleString("es-CL")}</td>
            </tr>
            <tr>
              {/* ✅ MOSTRAR EL PORCENTAJE REAL */}
              <td className="text-sm text-gray-600 py-2 px-2 text-right">IVA ({taxRate}%):</td>
              <td className="text-sm text-right py-2 px-2 font-medium">${iva.toLocaleString("es-CL")}</td>
            </tr>
            
            {/* 🛑 TOTAL BLINDADO: Usamos estilos inline con !important */}
            <tr 
              style={{ 
                backgroundColor: "black", 
                color: "white", 
                WebkitPrintColorAdjust: "exact", 
                printColorAdjust: "exact" 
              }}
            >
              <td className="py-3 px-4 text-xl font-black uppercase" style={{ color: "white" }}>TOTAL:</td>
              <td className="py-3 px-4 text-xl font-black text-right" style={{ color: "white" }}>
                ${order.totalAmount.toLocaleString("es-CL")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-20 text-center border-t border-dashed border-gray-300 pt-10">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
          Documento generado por Nexus Garage OS
        </p>
      </div>
    </div>
  );
}

function PrintScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          };
        `,
      }}
    />
  );
}