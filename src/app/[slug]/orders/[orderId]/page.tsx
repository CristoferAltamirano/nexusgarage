import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { OrderItems } from "@/components/orders/OrderItems"; 
import { StatusSelector } from "@/components/orders/StatusSelector"; // <--- AQUÍ ESTÁ
import { Button } from "@/components/ui/button";
import { Calendar, Car, User, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  params: Promise<{ slug: string; orderId: string }>;
}

export default async function OrderDetailsPage(props: Props) {
  const params = await props.params;
  const { slug, orderId } = params;
  
  const order = await db.workOrder.findUnique({
    where: { id: orderId },
    include: {
      vehicle: { include: { customer: true } },
      items: { orderBy: { description: 'asc' } }
    }
  });

  if (!order) return notFound();

  const inventory = await db.serviceProduct.findMany({
    where: { 
        tenantId: order.tenantId,
        deletedAt: null 
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-6xl mx-auto pb-20">
      
      {/* ENCABEZADO */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-200 pb-6">
        
        {/* TÍTULO Y DATOS */}
        <div className="flex items-start gap-3">
            <Link href={`/${slug}/orders`}>
                <Button variant="ghost" size="icon" className="shrink-0 mt-1 hover:bg-slate-100">
                    <ArrowLeft className="h-5 w-5 text-slate-500" />
                </Button>
            </Link>
            <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                        Orden #{order.number}
                    </h2>
                    {/* El estado en texto solo visible en móvil si quieres, o dejamos solo el selector */}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-slate-500 text-sm">
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-slate-700">
                        <Calendar className="h-3.5 w-3.5" /> 
                        {format(order.startDate, "dd MMM yyyy", { locale: es })}
                    </span>
                    {order.endDate && (
                        <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded font-medium border border-green-100">
                            Finalizado: {format(order.endDate, "dd MMM yyyy", { locale: es })}
                        </span>
                    )}
                </div>
            </div>
        </div>

        {/* ACCIONES: SELECTOR Y BOTONES */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2 lg:mt-0">
            
            {/* AQUÍ ESTÁ EL SELECTOR DE ESTADO */}
            <div className="w-full sm:w-auto">
                <StatusSelector orderId={order.id} currentStatus={order.status} />
            </div>
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <Link href={`/${slug}/orders/${order.id}/print`} target="_blank" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50">
                    <Printer className="mr-2 h-4 w-4" /> Imprimir
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="space-y-6">
            
            {/* Tarjeta Vehículo */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-slate-800 border-b border-slate-50 pb-2">
                    <Car className="h-5 w-5 text-indigo-500" /> Vehículo
                </h3>
                <div className="space-y-1">
                    <div className="text-xl font-bold uppercase tracking-wide bg-slate-100 w-fit px-2 rounded text-slate-800">
                        {order.vehicle.plateOrSerial}
                    </div>
                    <div className="text-slate-600 capitalize font-medium">
                        {order.vehicle.brand} {order.vehicle.model}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                    <div className="bg-slate-50 p-2 rounded">
                        <span className="block text-slate-400 text-xs uppercase font-bold mb-0.5">KM</span>
                        <span className="font-mono text-slate-700">{order.kilometer?.toLocaleString() || "---"}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                        <span className="block text-slate-400 text-xs uppercase font-bold mb-0.5">Combustible</span>
                        <span className="font-mono text-slate-700">{order.fuelLevel}%</span>
                    </div>
                </div>
            </div>

            {/* Tarjeta Cliente */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-slate-800 border-b border-slate-50 pb-2">
                    <User className="h-5 w-5 text-indigo-500" /> Cliente
                </h3>
                <div>
                    <div className="font-medium text-lg text-slate-900">
                        {order.vehicle.customer.firstName} {order.vehicle.customer.lastName}
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                        <span className="text-slate-500 text-sm bg-slate-50 px-2 py-1 rounded w-fit">
                            {order.vehicle.customer.phone}
                        </span>
                        {order.vehicle.customer.email && (
                            <span className="text-slate-500 text-sm px-2">
                                {order.vehicle.customer.email}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Motivo */}
             <div className="bg-amber-50 p-5 rounded-xl border border-amber-100 text-sm text-amber-900 shadow-sm">
                <strong className="block text-amber-800 mb-2 uppercase text-xs tracking-wider">Motivo de Ingreso</strong>
                <p className="leading-relaxed whitespace-pre-wrap">{order.description}</p>
            </div>
        </div>

        {/* COLUMNA DERECHA (Gestor de Ítems) */}
        <div className="lg:col-span-2">
            <OrderItems 
                orderId={order.id} 
                initialItems={order.items}
                products={inventory}
            />
        </div>
      </div>
    </div>
  );
}