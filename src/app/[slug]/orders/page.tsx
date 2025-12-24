import { db } from "@/lib/db";
// 1. IMPORTAMOS EL BOTÓN DE ELIMINAR
import { DeleteOrderButton } from "@/components/orders/delete-order-button";
import { CreateOrderDialog } from "@/components/dashboard/CreateOrderDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Importamos el buscador unificado
import Search from "@/components/ui/search"; 
import { FileText, Calendar, Printer, Eye, User, CarFront } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Configuración de renderizado dinámico
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrdersPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  // Capturamos el texto del buscador
  const query = typeof searchParams.query === "string" ? searchParams.query : "";

  const tenant = await db.tenant.findUnique({
    where: { slug: params.slug },
  });

  if (!tenant) return <div>Error: Taller no encontrado</div>;

  // 1. Buscamos Vehículos (Para el select del modal crear)
  const vehicles = await db.vehicle.findMany({
    where: { tenantId: tenant.id, deletedAt: null },
    include: { customer: true },
    orderBy: { createdAt: 'desc' },
    take: 50 
  });

  // 2. Buscamos Órdenes
  const orders = await db.workOrder.findMany({
    where: {
      tenantId: tenant.id,
      deletedAt: null, 
      OR: query ? [
        { vehicle: { plateOrSerial: { contains: query, mode: 'insensitive' } } },
        { vehicle: { brand: { contains: query, mode: 'insensitive' } } },
        { vehicle: { customer: { firstName: { contains: query, mode: 'insensitive' } } } },
        { vehicle: { customer: { lastName: { contains: query, mode: 'insensitive' } } } },
        // Truco para buscar por número si el query es numérico
        !isNaN(Number(query)) ? { number: Number(query) } : {}
      ] : undefined
    },
    include: {
      vehicle: {
        include: { customer: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50 
  });

  return (
    // 🔥 CORRECCIÓN 1: Contenedor global que impide el desborde de la pantalla
    <div className="w-full max-w-[100vw] flex-1 space-y-8 p-4 md:p-8 pt-6 pb-20 overflow-x-hidden">

      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Órdenes de Trabajo</h2>
          <p className="text-slate-500 text-sm mt-1">Gestiona el flujo de trabajo.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          
          {/* BUSCADOR UNIFICADO */}
          <div className="w-full md:w-80">
             <Search placeholder="Patente, cliente o N°..." />
          </div>
          
          <div className="shrink-0">
            <CreateOrderDialog 
                tenantId={tenant.id} 
                slug={params.slug} 
                vehicles={vehicles} 
            />
          </div>
        </div>
      </div>

      {/* TABLA RESPONSIVA */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        
        {/* 🔥 CORRECCIÓN 2: Habilitamos scroll horizontal si la tabla es muy ancha */}
        <div className="w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
            
            {/* Ancho mínimo para forzar estructura correcta en móviles */}
            <table className="w-full caption-bottom text-sm min-w-[800px]">
                <thead className="bg-slate-50">
                    <tr className="border-b border-slate-100">
                        {/* ID */}
                        <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs w-[80px]">
                            ID
                        </th>
                        
                        {/* ESTADO */}
                        <th className="h-10 px-4 md:px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs">
                            Estado
                        </th>
                        
                        {/* VEHÍCULO */}
                        <th className="h-10 px-4 md:px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs">
                            Vehículo
                        </th>
                        
                        {/* CLIENTE (Oculto en móvil pequeño) */}
                        <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden sm:table-cell">
                            Cliente
                        </th>
                        
                        {/* FECHA (Oculto en móvil/tablet) */}
                        <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden lg:table-cell">
                            Fecha
                        </th>
                        
                        {/* TOTAL */}
                        <th className="h-10 px-4 md:px-6 text-right align-middle font-medium text-slate-500 uppercase text-xs">
                            Total
                        </th>
                        
                        <th className="h-10 px-4 md:px-6 w-[120px] text-right"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {orders.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                    <FileText className="h-10 w-10 mb-2 opacity-20" />
                                    <p>{query ? "No encontramos esa orden." : "No hay órdenes creadas."}</p>
                                </div>
                            </td>
                        </tr>
                    )}
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                            
                            {/* ID */}
                            <td className="p-6 align-middle">
                                <span className="font-mono font-bold text-slate-600 text-sm">#{order.number}</span>
                            </td>

                            {/* Estado */}
                            <td className="p-4 md:p-6 align-middle">
                                <Badge variant="secondary" className={`font-medium border-0 px-2.5 py-0.5 text-xs whitespace-nowrap ${
                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                    order.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                    order.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                                    order.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {order.status === 'DELIVERED' ? 'Entregado' :
                                    order.status === 'COMPLETED' ? 'Terminado' :
                                    order.status === 'PENDING' ? 'Pendiente' : 
                                    order.status === 'IN_PROGRESS' ? 'En Taller' : 
                                    order.status === 'WAITING_PARTS' ? 'Repuestos' : 'Cancelado'}
                                </Badge>
                            </td>

                            {/* Vehículo */}
                            <td className="p-4 md:p-6 align-middle">
                                <div className="flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono font-normal text-[10px] md:text-xs bg-slate-50 border-slate-300 text-slate-700 uppercase whitespace-nowrap">
                                            {order.vehicle.plateOrSerial}
                                        </Badge>
                                        <span className="text-xs text-slate-500 capitalize truncate max-w-[120px] md:max-w-none">
                                            {order.vehicle.brand} {order.vehicle.model}
                                        </span>
                                    </div>
                                    
                                    {/* Cliente visible solo en móvil (porque la columna cliente se oculta) */}
                                    <div className="sm:hidden flex items-center gap-1 mt-0.5 text-[10px] text-indigo-600 font-medium">
                                        <User className="h-3 w-3" />
                                        {order.vehicle.customer.firstName} {order.vehicle.customer.lastName}
                                    </div>
                                </div>
                            </td>

                            {/* Cliente (PC) */}
                            <td className="p-6 align-middle hidden sm:table-cell">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                        {order.vehicle.customer.firstName[0]}{order.vehicle.customer.lastName[0]}
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">
                                        {order.vehicle.customer.firstName} {order.vehicle.customer.lastName}
                                    </span>
                                </div>
                            </td>

                            {/* Fecha (PC Grande) */}
                            <td className="p-6 align-middle hidden lg:table-cell">
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <Calendar className="h-3 w-3 opacity-70" />
                                    {format(order.startDate, "dd MMM yyyy", { locale: es })}
                                </div>
                            </td>

                            {/* Total */}
                            <td className="p-4 md:p-6 align-middle text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                                ${(order.totalAmount || 0).toLocaleString("es-CL")}
                            </td>

                            {/* ACCIONES */}
                            <td className="p-4 md:p-6 align-middle text-right">
                                <div className="flex justify-end gap-1">
                                    {/* Botón Ver */}
                                    <Link href={`/${params.slug}/orders/${order.id}`}>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    
                                    {/* Botón Imprimir (Solo PC para no saturar móvil) */}
                                    <Link href={`/${params.slug}/orders/${order.id}/print`} target="_blank" className="hidden sm:inline-flex">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100 text-slate-400">
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    </Link>

                                    {/* Botón Eliminar */}
                                    <DeleteOrderButton 
                                        id={order.id} 
                                        tenantId={tenant.id} 
                                        slug={params.slug} 
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}