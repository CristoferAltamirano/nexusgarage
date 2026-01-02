import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Car, User, Printer, ArrowLeft } from "lucide-react";

// Components UI & Domain
import { Button } from "@/components/ui/button";
import { OrderItems } from "@/components/orders/OrderItems"; 
import { StatusSelector } from "@/components/orders/StatusSelector"; 
import WhatsAppButton from "@/components/orders/WhatsAppButton"; 

interface Props {
  params: Promise<{ slug: string; orderId: string }>;
}

export default async function OrderDetailsPage(props: Props) {
  // 1. Desempaquetamos los params (Patrón de Next.js 15)
  const params = await props.params;
  const { slug, orderId } = params;
  
  // 2. SEGURIDAD Y DATOS DEL TALLER
  // Traemos el 'name' para el WhatsApp y 'taxRate' para los cálculos
  const tenant = await db.tenant.findUnique({
    where: { slug },
    select: { 
        id: true, 
        name: true,    // ✅ Nombre del taller (ej. "Taller Altamirano")
        taxRate: true  // IVA Configurable
    }
  });

  if (!tenant) return notFound();

  // 3. Buscamos la orden (con validación de seguridad por Tenant)
  const order = await db.workOrder.findFirst({
    where: { 
        id: orderId,
        tenantId: tenant.id 
    },
    include: {
      vehicle: { include: { customer: true } },
      items: { orderBy: { description: 'asc' } }
    }
  });

  if (!order) return notFound();

  // 4. Inventario disponible (para el autocompletado en la cotización)
  const inventory = await db.serviceProduct.findMany({
    where: { 
        tenantId: tenant.id, 
        deletedAt: null 
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-6xl mx-auto pb-20">
      
      {/* ENCABEZADO PRINCIPAL */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-200 pb-6">
        
        {/* TÍTULO Y METADATA */}
        <div className="flex items-start gap-3">
            <Link href={`/${slug}/orders`}>
                <Button variant="ghost" size="icon" className="shrink-0 mt-1 hover:bg-slate-100" title="Volver a la lista">
                    <ArrowLeft className="h-5 w-5 text-slate-500" />
                </Button>
            </Link>
            <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                        Orden #{order.number}
                    </h2>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-slate-500 text-sm">
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-slate-700">
                        <Calendar className="h-3.5 w-3.5" /> 
                        {format(order.startDate, "dd MMM yyyy", { locale: es })}
                    </span>
                    {order.endDate && (
                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium border border-emerald-100">
                            Finalizado: {format(order.endDate, "dd MMM yyyy", { locale: es })}
                        </span>
                    )}
                </div>
            </div>
        </div>

        {/* BARRA DE ACCIONES */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2 lg:mt-0">
            
            {/* 1. Selector de Estado (Con Automatización WhatsApp + Edición) */}
            <div className="w-full sm:w-auto min-w-[180px]">
                <StatusSelector 
                    orderId={order.id} 
                    currentStatus={order.status}
                    // 👇 Datos inyectados para el Toast Inteligente y el Modal
                    customerName={`${order.vehicle.customer.firstName} ${order.vehicle.customer.lastName}`}
                    customerPhone={order.vehicle.customer.phone}
                    vehicleInfo={`${order.vehicle.brand} ${order.vehicle.model}`}
                    orderNumber={order.number}
                    tenantName={tenant.name} // ✅ Pasamos el nombre real del taller
                />
            </div>
            
            {/* Divisor Visual */}
            <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>
            
            {/* 2. Botón WhatsApp Manual */}
            <WhatsAppButton 
                phone={order.vehicle.customer.phone}
                customerName={order.vehicle.customer.firstName}
                vehicleModel={`${order.vehicle.brand} ${order.vehicle.model}`}
                status={order.status}
                orderNumber={order.number}
            />

            {/* 3. Botón Imprimir */}
            <Link href={`/${slug}/orders/${order.id}/print`} target="_blank" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 gap-2">
                    <Printer className="h-4 w-4" /> 
                    <span className="hidden sm:inline">Imprimir</span>
                </Button>
            </Link>
        </div>
      </div>

      {/* CONTENIDO: GRILLA 2 COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA (Info Contextual) */}
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
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="block text-slate-400 text-[10px] uppercase font-bold mb-0.5">Kilometraje</span>
                        <span className="font-mono text-slate-700 font-medium">{order.kilometer?.toLocaleString() || "---"} km</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="block text-slate-400 text-[10px] uppercase font-bold mb-0.5">Combustible</span>
                        <span className="font-mono text-slate-700 font-medium">{order.fuelLevel}%</span>
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
                    <div className="flex flex-col gap-2 mt-2">
                        <span className="text-slate-600 text-sm bg-slate-50 px-2 py-1.5 rounded border border-slate-100 w-full flex items-center gap-2">
                            📱 {order.vehicle.customer.phone}
                        </span>
                        {order.vehicle.customer.email && (
                            <span className="text-slate-500 text-sm px-1 truncate">
                                ✉️ {order.vehicle.customer.email}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Motivo de Ingreso */}
             <div className="bg-amber-50/80 p-5 rounded-xl border border-amber-100 text-sm text-amber-900 shadow-sm">
                <strong className="block text-amber-800 mb-2 uppercase text-xs tracking-wider font-bold">Motivo de Ingreso</strong>
                <p className="leading-relaxed whitespace-pre-wrap text-amber-950/80">{order.description}</p>
            </div>
        </div>

        {/* COLUMNA DERECHA (Gestor de Ítems / Cotizador) */}
        <div className="lg:col-span-2">
            <OrderItems 
                orderId={order.id} 
                initialItems={order.items}
                products={inventory}
                slug={slug}
                taxRate={tenant.taxRate || 0}
            />
        </div>
      </div>
    </div>
  );
}