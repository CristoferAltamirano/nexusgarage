import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  params: Promise<{ slug: string; orderId: string }>;
}

export default async function OrderPrintPage(props: Props) {
  const params = await props.params;

  // 1. Buscamos la Orden
  // CORRECCIÓN: Accedemos al cliente A TRAVÉS del vehículo (vehicle.customer)
  const order = await db.workOrder.findUnique({
    where: { id: params.orderId },
    include: {
      vehicle: {
        include: {
            customer: true // <--- Aquí es donde vive el cliente
        }
      },
      items: { include: { product: true } }, 
      tenant: true, 
    },
  });

  if (!order) return notFound();

  // 2. Extraemos los datos para usarlos más fácil
  const { tenant, vehicle, items } = order;
  const customer = vehicle.customer; // <--- Obtenemos el cliente desde el vehículo

  // 3. Cálculos de totales (Tipado explícito para evitar errores de TS)
  const total = items.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
  const iva = total * 0.19; // IVA Chile (19%)
  const totalConIva = total + iva;

  return (
    <div className="bg-white min-h-screen text-black p-8 md:p-12 max-w-[210mm] mx-auto print:p-0 print:max-w-none">
      
      {/* 1. ENCABEZADO DEL TALLER */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div className="flex gap-4">
            {/* Si hay logo, lo mostramos */}
            {tenant.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tenant.logoUrl} alt="Logo" className="h-20 w-auto object-contain" />
            )}
            <div>
                <h1 className="text-2xl font-bold uppercase tracking-wide">{tenant.name}</h1>
                <p className="text-sm text-gray-600 whitespace-pre-line">{tenant.address || "Dirección no registrada"}</p>
                <p className="text-sm text-gray-600">
                    {tenant.phone && <span>{tenant.phone} | </span>}
                    {tenant.email}
                </p>
                {tenant.website && <p className="text-sm text-gray-600">{tenant.website}</p>}
            </div>
        </div>
        <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">ORDEN #{order.number}</h2>
            <p className="text-sm text-gray-500">Fecha: {format(order.startDate, "dd 'de' MMMM, yyyy", { locale: es })}</p>
            <div className="mt-2 inline-block bg-gray-100 px-3 py-1 rounded text-sm font-semibold uppercase">
                {order.status}
            </div>
        </div>
      </div>

      {/* 2. DATOS DEL CLIENTE Y VEHÍCULO */}
      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div>
            <h3 className="font-bold text-gray-900 border-b mb-2 uppercase text-xs">Cliente</h3>
            <p className="font-semibold text-lg">{customer.firstName} {customer.lastName}</p>
            <p className="text-gray-600">{customer.taxId || "Sin RUT"}</p>
            <p className="text-gray-600">{customer.phone}</p>
            <p className="text-gray-600">{customer.email}</p>
        </div>
        <div>
            <h3 className="font-bold text-gray-900 border-b mb-2 uppercase text-xs">Vehículo</h3>
            <p className="font-semibold text-lg uppercase">{vehicle.brand} {vehicle.model}</p>
            <p className="font-mono text-gray-600 bg-gray-100 inline-block px-1 rounded">{vehicle.plateOrSerial}</p>
            <p className="text-gray-600 mt-1">KM: {order.kilometer?.toLocaleString() || "N/A"}</p>
            <p className="text-gray-600">Combustible: {order.fuelLevel ? `${order.fuelLevel}%` : "N/A"}</p>
        </div>
      </div>

      {/* 3. DESCRIPCIÓN DEL PROBLEMA */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 border-b mb-2 uppercase text-xs">Motivo de Ingreso / Diagnóstico</h3>
        <p className="text-gray-700 bg-gray-50 p-3 rounded-md border text-sm italic">
            {order.description}
        </p>
      </div>

      {/* 4. TABLA DE ÍTEMS (Repuestos y Mano de Obra) */}
      <table className="w-full text-sm mb-8">
        <thead>
            <tr className="border-b-2 border-black text-left">
                <th className="py-2">Descripción</th>
                <th className="py-2 text-center w-20">Cant.</th>
                <th className="py-2 text-right w-32">Precio Unit.</th>
                <th className="py-2 text-right w-32">Total</th>
            </tr>
        </thead>
        <tbody className="divide-y">
            {items.map((item) => (
                <tr key={item.id}>
                    <td className="py-3">
                        <span className="font-medium">{item.description}</span>
                        {/* Si viene de un producto del inventario, mostramos código */}
                        {item.product && <span className="text-xs text-gray-400 ml-2">({item.product.code})</span>}
                    </td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">${item.price.toLocaleString("es-CL")}</td>
                    <td className="py-3 text-right font-medium">${(item.quantity * item.price).toLocaleString("es-CL")}</td>
                </tr>
            ))}
            {items.length === 0 && (
                <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 italic">
                        No hay ítems registrados en esta orden aún.
                    </td>
                </tr>
            )}
        </tbody>
      </table>

      {/* 5. TOTALES */}
      <div className="flex justify-end mb-12">
        <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal Neto</span>
                <span>${total.toLocaleString("es-CL")}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (19%)</span>
                <span>${iva.toLocaleString("es-CL")}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>TOTAL</span>
                <span>${totalConIva.toLocaleString("es-CL")}</span>
            </div>
        </div>
      </div>

      {/* 6. PIE DE PÁGINA (FIRMAS) */}
      <div className="grid grid-cols-2 gap-12 mt-20 pt-8 page-break-inside-avoid">
        <div className="text-center">
            <div className="border-t border-gray-300 w-3/4 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500 uppercase">Firma del Taller</p>
        </div>
        <div className="text-center">
            <div className="border-t border-gray-300 w-3/4 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500 uppercase">Firma Cliente (Aceptación)</p>
        </div>
      </div>

      {/* 7. BOTÓN PARA IMPRIMIR (Solo visible en pantalla) */}
      <div className="fixed bottom-8 right-8 print:hidden">
         <button 
            onClick={() => window.print()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-indigo-700 font-bold flex items-center gap-2 transition-transform hover:scale-105"
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Imprimir PDF
         </button>
      </div>

      <style jsx global>{`
        @media print {
            @page { margin: 0; size: auto; }
            body { background: white; }
        }
      `}</style>
    </div>
  );
}