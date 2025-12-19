import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function PrintOrderPage({ params }: { params: { orderId: string } }) {
  const order = await db.workOrder.findUnique({
    where: { id: params.orderId },
    include: {
      vehicle: { include: { customer: true } },
      items: true,
      tenant: true,
    },
  });

  if (!order) return notFound();

  // 🛡️ Salvavidas para evitar la pantalla blanca
  const customerName = `${order.vehicle?.customer?.firstName ?? "Cliente"} ${order.vehicle?.customer?.lastName ?? ""}`;
  const dateStr = order.createdAt ? format(new Date(order.createdAt), "dd 'de' MMMM, yyyy", { locale: es }) : "Fecha no disponible";

  return (
    <div className="p-10 bg-white text-black min-h-screen">
      {/* Botón para activar el diálogo de impresión del navegador automáticamente */}
      <script dangerouslySetInnerHTML={{ __html: "window.print()" }} />

      <div className="flex justify-between border-b-2 pb-5 mb-5">
        <div>
          <h1 className="text-3xl font-bold uppercase">{order.tenant?.name ?? "NEXUS GARAGE"}</h1>
          <p className="text-sm text-gray-500">Orden de Trabajo #{order.number}</p>
        </div>
        <div className="text-right">
          <p className="font-bold">Fecha de Ingreso</p>
          <p>{dateStr}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10 mb-10">
        <div>
          <h3 className="font-bold border-b mb-2">CLIENTE</h3>
          <p className="font-medium">{customerName}</p>
          <p>{order.vehicle?.customer?.phone ?? "Sin teléfono"}</p>
          <p className="text-sm text-gray-600">{order.vehicle?.customer?.email ?? ""}</p>
        </div>
        <div>
          <h3 className="font-bold border-b mb-2">VEHÍCULO</h3>
          <p className="font-medium uppercase">{order.vehicle?.brand} {order.vehicle?.model}</p>
          <p className="font-mono bg-gray-100 inline-block px-2">Patente: {order.vehicle?.plateOrSerial}</p>
        </div>
      </div>

      <table className="w-full mb-10">
        <thead>
          <tr className="border-b-2 text-left">
            <th className="py-2">Descripción</th>
            <th className="py-2 text-center">Cant.</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.description}</td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-right">${item.price.toLocaleString("es-CL")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Neto:</span>
            <span>${(order.totalAmount / 1.19).toLocaleString("es-CL", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>IVA (19%):</span>
            <span>${(order.totalAmount - (order.totalAmount / 1.19)).toLocaleString("es-CL", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>TOTAL:</span>
            <span>${order.totalAmount.toLocaleString("es-CL")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}