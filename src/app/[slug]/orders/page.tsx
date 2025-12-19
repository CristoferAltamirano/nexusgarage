import { db } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateOrderDialog } from "@/components/dashboard/CreateOrderDialog";
import { Search, FileText, Calendar, Printer, Eye, User, Hash } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// 👇 AGREGA ESTAS 2 LÍNEAS AQUÍ MISMO:
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function OrdersPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  const tenant = await db.tenant.findUnique({
    where: { slug: params.slug },
  });

  if (!tenant) return <div>Error: Taller no encontrado</div>;

  // 1. Buscamos Vehículos (Select modal)
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
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">

      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Órdenes de Trabajo</h2>
          <p className="text-slate-500 text-sm mt-1">Gestiona el flujo de trabajo.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                name="q" 
                placeholder="Patente, cliente o N°..." 
                className="pl-10 h-10 w-full bg-white" 
                defaultValue={query} 
            />
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
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                {/* ID: Oculto en celular para ahorrar espacio (hidden md:table-cell) */}
                <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs w-[80px] hidden md:table-cell">
                    ID
                </th>
                
                {/* ESTADO: Oculto en celular muy pequeño, visible en md */}
                <th className="h-10 px-4 md:px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden sm:table-cell">
                    Estado
                </th>
                
                {/* VEHÍCULO: Visible siempre (Columna Principal) */}
                <th className="h-10 px-4 md:px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs">
                    Vehículo
                </th>
                
                {/* CLIENTE: Oculto siempre en móvil (fusionado con vehículo) */}
                <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden lg:table-cell">
                    Cliente
                </th>
                
                {/* FECHA: Solo en PC */}
                <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden xl:table-cell">
                    Fecha
                </th>
                
                {/* TOTAL: Visible siempre */}
                <th className="h-10 px-4 md:px-6 text-right align-middle font-medium text-slate-500 uppercase text-xs">
                    Total
                </th>
                
                <th className="h-10 px-4 md:px-6 w-[50px] md:w-[100px] text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 && (
                <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <FileText className="h-10 w-10 mb-2 opacity-20" />
                            <p>No se encontraron órdenes.</p>
                        </div>
                    </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* COLUMNA 1: ID (Solo PC) */}
                  <td className="p-6 align-middle hidden md:table-cell">
                    <span className="font-mono font-bold text-slate-600 text-sm">#{order.number}</span>
                  </td>

                  {/* COLUMNA 2: Estado (Solo Tablet/PC) - En móvil lo ponemos con el vehículo */}
                  <td className="p-4 md:p-6 align-middle hidden sm:table-cell">
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

                  {/* COLUMNA 3: Vehículo (Información condensada en móvil) */}
                  <td className="p-4 md:p-6 align-middle">
                    <div className="flex flex-col items-start gap-1">
                      
                      {/* En móvil mostramos el #ID y el Estado aquí arriba */}
                      <div className="flex items-center gap-2 sm:hidden mb-1">
                         <span className="text-[10px] font-mono font-bold text-slate-500">#{order.number}</span>
                         <span className={`h-2 w-2 rounded-full ${
                             order.status === 'DELIVERED' ? 'bg-green-500' :
                             order.status === 'COMPLETED' ? 'bg-blue-500' :
                             order.status === 'IN_PROGRESS' ? 'bg-purple-500' : 'bg-yellow-500'
                         }`}></span>
                      </div>

                      <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] md:text-xs bg-slate-100 border border-slate-300 px-1.5 rounded text-slate-700 uppercase whitespace-nowrap">
                             {order.vehicle.plateOrSerial}
                          </span>
                          <span className="text-xs text-slate-500 capitalize truncate max-w-[120px] md:max-w-none">
                            {order.vehicle.brand} {order.vehicle.model}
                          </span>
                      </div>
                      
                      {/* Cliente visible SOLO en móvil aquí */}
                      <div className="lg:hidden flex items-center gap-1 mt-0.5 text-[10px] md:text-xs text-indigo-600 font-medium">
                         <User className="h-3 w-3" />
                         {order.vehicle.customer.firstName} {order.vehicle.customer.lastName}
                      </div>
                    </div>
                  </td>

                  {/* COLUMNA 4: Cliente (Solo PC Grande) */}
                  <td className="p-6 align-middle hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                          {order.vehicle.customer.firstName[0]}{order.vehicle.customer.lastName[0]}
                       </div>
                       <span className="text-sm font-medium text-slate-700 truncate">
                          {order.vehicle.customer.firstName} {order.vehicle.customer.lastName}
                       </span>
                    </div>
                  </td>

                  {/* COLUMNA 5: Fecha (Solo PC Extra Grande) */}
                  <td className="p-6 align-middle hidden xl:table-cell">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                       <Calendar className="h-3 w-3 opacity-70" />
                       {format(order.startDate, "dd MMM yyyy", { locale: es })}
                    </div>
                  </td>

                  {/* COLUMNA 6: Total (Siempre visible) */}
                  <td className="p-4 md:p-6 align-middle text-right font-bold text-slate-900 text-sm">
                     ${order.totalAmount.toLocaleString("es-CL")}
                  </td>

                  {/* COLUMNA 7: Acciones */}
                  <td className="p-4 md:p-6 align-middle text-right">
                    <div className="flex justify-end gap-1">
                        <Link href={`/${params.slug}/orders/${order.id}`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400">
                                <Eye className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={`/${params.slug}/orders/${order.id}/print`} target="_blank" className="hidden sm:inline-flex">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100 text-slate-400">
                                <Printer className="h-4 w-4" />
                            </Button>
                        </Link>
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