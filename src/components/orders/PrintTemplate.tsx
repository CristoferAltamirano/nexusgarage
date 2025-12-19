"use client"; // 👈 ESTO ES LA MAGIA QUE ARREGLA EL ERROR

import { useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  order: any; // Usamos any por simplicidad para el build, o puedes tiparlo
  tenant: any;
}

export function PrintTemplate({ order, tenant }: Props) {
  
  // Auto-imprimir cuando carga la página
  useEffect(() => {
    setTimeout(() => {
      window.print();
    }, 500);
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white text-black print:p-0">
      
      {/* CABECERA */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">{tenant.name}</h1>
          <p className="text-sm text-slate-600 mt-1">Orden de Trabajo #{order.number}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase">Fecha de Ingreso</p>
          <p className="text-lg font-bold">
            {format(new Date(order.startDate), "dd 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
      </div>

      {/* DATOS DEL CLIENTE Y VEHICULO */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Cliente</h3>
          <p className="font-bold text-lg">{order.vehicle.customer.firstName} {order.vehicle.customer.lastName}</p>
          <p className="text-slate-600">{order.vehicle.customer.email}</p>
          <p className="text-slate-600">{order.vehicle.customer.phone}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-1">Vehículo</h3>
          <p className="font-bold text-lg">{order.vehicle.brand} {order.vehicle.model}</p>
          <p className="text-slate-600 uppercase tracking-widest bg-slate-100 inline-block px-2 py-0.5 rounded text-xs font-bold mt-1">
            {order.vehicle.plate}
          </p>
          <p className="text-sm text-slate-500 mt-1">{order.vehicle.year}</p>
        </div>
      </div>

      {/* TABLA DE ITEMS */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b border-slate-300">
            <th className="text-left py-2 text-xs font-bold uppercase text-slate-500">Descripción</th>
            <th className="text-right py-2 text-xs font-bold uppercase text-slate-500">Cantidad</th>
            <th className="text-right py-2 text-xs font-bold uppercase text-slate-500">Precio Unit.</th>
            <th className="text-right py-2 text-xs font-bold uppercase text-slate-500">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {order.items.map((item: any) => (
            <tr key={item.id}>
              <td className="py-3 text-sm font-medium">{item.description}</td>
              <td className="py-3 text-sm text-right">{item.quantity}</td>
              <td className="py-3 text-sm text-right">${item.unitPrice.toLocaleString("es-CL")}</td>
              <td className="py-3 text-sm text-right font-bold">${(item.quantity * item.unitPrice).toLocaleString("es-CL")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALES */}
      <div className="flex justify-end border-t-2 border-slate-900 pt-4">
        <div className="text-right">
          <p className="text-sm text-slate-500">Total a Pagar</p>
          <p className="text-4xl font-black text-slate-900">${order.totalAmount.toLocaleString("es-CL")}</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>Gracias por preferir a {tenant.name}</p>
        <p className="mt-1">Documento generado por Nexus Garage OS</p>
      </div>

      <style jsx global>{`
        @media print {
          @page { margin: 20mm; }
          body { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}