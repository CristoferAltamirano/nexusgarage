import { db } from "@/lib/db";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Status } from "@prisma/client";
import {
  CarFront,
  Users,
  DollarSign,
  Wrench,
  CalendarDays,
  Eye,
  TrendingUp,
  Package,
  FileText,
  Printer
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateOrderDialog } from "@/components/dashboard/CreateOrderDialog";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DownloadReportButton } from "@/components/dashboard/DownloadReportButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DashboardPage(props: Props) {
  const params = await props.params;
  const { slug } = params;

  const tenant = await db.tenant.findUnique({
    where: { slug },
  });

  if (!tenant) return <div>Taller no encontrado</div>;

  // ================= LOGICA DE DATOS =================

  const today = new Date();
  const daysToQuery = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      return {
          date,
          label: format(date, "eee dd", { locale: es }),
          start: startOfDay(date),
          end: endOfDay(date)
      };
  });

  const revenueStatuses = [Status.COMPLETED, Status.DELIVERED];

  // 🚀 EJECUCIÓN PARALELA
  const results = await Promise.all([
      // A) Gráfico
      ...daysToQuery.map(day => 
          db.workOrder.aggregate({
              where: {
                  tenantId: tenant.id,
                  status: { in: revenueStatuses }, 
                  deletedAt: null,
                  endDate: { gte: day.start, lte: day.end } 
              },
              _sum: { totalAmount: true }
          })
      ),
      // B) Vehículos
      db.vehicle.findMany({
          where: { tenantId: tenant.id, deletedAt: null },
          select: {
              id: true,
              plateOrSerial: true,
              brand: true,
              model: true,
              customer: {
                  select: {
                      firstName: true,
                      lastName: true
                  }
              }
          },
          orderBy: { createdAt: 'desc' },
          take: 10 
      }),
      // C) Órdenes Recientes
      db.workOrder.findMany({
          where: { tenantId: tenant.id, deletedAt: null },
          select: {
              id: true,
              number: true,
              status: true,
              startDate: true,
              totalAmount: true,
              vehicle: {
                  select: {
                      brand: true,
                      model: true,
                      customer: {
                          select: {
                              firstName: true,
                              lastName: true
                          }
                      }
                  }
              }
          },
          orderBy: { createdAt: "desc" },
          take: 5,
      }),
      // D) Activas
      db.workOrder.count({
          where: { 
            tenantId: tenant.id, 
            status: { notIn: [Status.DELIVERED, Status.COMPLETED, Status.CANCELLED] }, 
            deletedAt: null 
          }
      }),
      // E) Clientes
      db.customer.count({
          where: { tenantId: tenant.id, deletedAt: null }
      }),
      // F) Ingresos Totales
      db.workOrder.aggregate({
          where: { 
            tenantId: tenant.id, 
            status: { in: revenueStatuses }, 
            deletedAt: null 
          },
          _sum: { totalAmount: true }
      })
  ]);

  // ================= PROCESAMIENTO =================
  const chartResults = results.slice(0, 7) as Array<{ _sum: { totalAmount: number | null } }>;

  // Use inferred types for safety
  const vehicles = results[7] as {
      id: string;
      plateOrSerial: string;
      brand: string;
      model: string;
      customer: {
          firstName: string;
          lastName: string;
      };
  }[];

  const recentOrders = results[8] as {
      id: string;
      number: number;
      status: Status;
      startDate: Date;
      totalAmount: number;
      vehicle: {
          brand: string;
          model: string;
          customer: {
              firstName: string;
              lastName: string;
          };
      };
  }[];

  const activeOrdersCount = results[9] as number;
  const customersCount = results[10] as number;
  const revenue = results[11] as { _sum: { totalAmount: number | null } };

  const last7DaysData = chartResults.map((res, index) => ({
      name: daysToQuery[index].label,
      total: res._sum.totalAmount || 0
  }));

  return (
    // CAMBIO CLAVE AQUÍ: Eliminé 'bg-slate-50' para que sea transparente
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 pb-20 min-h-full">

      {/* ENCABEZADO */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Dashboard <span className="text-orange-600">Pro</span>
            </h2>
            <p className="text-slate-500">Panel de control general del taller.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <DownloadReportButton tenantId={tenant.id} />
          <CreateOrderDialog
            tenantId={tenant.id}
            slug={slug}
            vehicles={vehicles} 
          />
        </div>
      </div>

      {/* ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href={`/${slug}/customers`}>
            <div className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all flex flex-col items-center justify-center gap-2 h-24">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 group-hover:bg-orange-600 group-hover:text-white transition-colors flex items-center justify-center">
                    <Users className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-orange-700">Clientes</span>
            </div>
        </Link>

        <Link href={`/${slug}/vehicles`}>
            <div className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all flex flex-col items-center justify-center gap-2 h-24">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 group-hover:bg-orange-600 group-hover:text-white transition-colors flex items-center justify-center">
                    <CarFront className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-orange-700">Vehículos</span>
            </div>
        </Link>

        <Link href={`/${slug}/settings/catalog`}>
            <div className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all flex flex-col items-center justify-center gap-2 h-24">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 group-hover:bg-orange-600 group-hover:text-white transition-colors flex items-center justify-center">
                    <Package className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-orange-700">Inventario</span>
            </div>
        </Link>

        <Link href={`/${slug}/orders`}>
            <div className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 transition-all flex flex-col items-center justify-center gap-2 h-24">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 group-hover:bg-orange-600 group-hover:text-white transition-colors flex items-center justify-center">
                    <FileText className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-orange-700">Órdenes</span>
            </div>
        </Link>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Card 1: Ingresos */}
        <div className="rounded-xl border bg-white shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-semibold text-slate-500 uppercase">Ingresos Históricos</h3>
                <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                     <DollarSign className="h-5 w-5" />
                </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
                ${(revenue._sum.totalAmount || 0).toLocaleString("es-CL")}
            </div>
            <p className="text-xs text-emerald-600 flex items-center mt-1 font-bold">
                <TrendingUp className="h-3 w-3 mr-1" /> Total facturado
            </p>
        </div>

        {/* Card 2: En Taller */}
        <div className="rounded-xl border bg-white shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-semibold text-slate-500 uppercase">En Taller</h3>
                <div className="h-9 w-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700">
                    <Wrench className="h-5 w-5" />
                </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{activeOrdersCount}</div>
             <p className="text-xs text-slate-500 mt-1">Vehículos en proceso</p>
        </div>

        {/* Card 3: Clientes */}
        <div className="rounded-xl border bg-white shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-600"></div>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-semibold text-slate-500 uppercase">Clientes</h3>
                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                    <Users className="h-5 w-5" />
                </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{customersCount}</div>
             <p className="text-xs text-slate-500 mt-1">Total registrados</p>
        </div>

        {/* Card 4: Flota */}
        <div className="rounded-xl border bg-white shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-all">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-semibold text-slate-500 uppercase">Flota</h3>
                 <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                    <CarFront className="h-5 w-5" />
                </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{vehicles.length}</div>
            <p className="text-xs text-slate-500 mt-1">Autos en sistema</p>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

        {/* GRÁFICO */}
        <RevenueChart data={last7DaysData} />

        {/* TABLA DE ÓRDENES RECIENTES */}
        <div className="xl:col-span-4 rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-lg font-bold text-slate-900">Órdenes Recientes</h3>
                 <Link href={`/${slug}/orders`} className="text-sm text-orange-600 hover:text-orange-700 font-bold hover:underline">
                    Ver todas &rarr;
                 </Link>
            </div>
            <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                    <thead className="bg-white">
                        <tr className="border-b border-slate-100">
                            <th className="h-12 px-4 md:px-6 text-left align-middle font-bold text-slate-600 uppercase text-xs w-20 hidden sm:table-cell">ID</th>
                            <th className="h-12 px-4 md:px-6 text-left align-middle font-bold text-slate-600 uppercase text-xs">Cliente / Vehículo</th>
                            <th className="h-12 px-4 md:px-6 text-left align-middle font-bold text-slate-600 uppercase text-xs">Estado</th>
                            <th className="h-12 px-6 text-left align-middle font-bold text-slate-600 uppercase text-xs hidden md:table-cell">Fecha Ingreso</th>
                            <th className="h-12 px-4 md:px-6 text-right align-middle font-bold text-slate-600 uppercase text-xs">Total</th>
                            <th className="h-12 px-4 md:px-6 text-right align-middle w-20"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {recentOrders.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No hay órdenes recientes.
                                </td>
                            </tr>
                        )}
                        {recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 md:p-6 align-middle font-mono text-xs font-bold text-slate-500 hidden sm:table-cell">
                                    #{order.number}
                                </td>
                                <td className="p-4 md:p-6 align-middle">
                                    <div className="flex flex-col">
                                         <span className="font-bold text-slate-900 text-sm truncate max-w-30">
                                            {order.vehicle.customer.firstName} {order.vehicle.customer.lastName}
                                         </span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-30 font-medium">
                                            <CarFront className="h-3 w-3 shrink-0 text-orange-500" /> {order.vehicle.brand} {order.vehicle.model}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 md:p-6 align-middle">
                                     <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                                        order.status === 'DELIVERED' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border border-green-200' :
                                        order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-100' :
                                        'bg-orange-50 text-orange-700 border border-orange-100'
                                    }`}>
                                        {order.status === 'DELIVERED' ? 'Entregado' : 
                                         order.status === 'COMPLETED' ? 'Terminado' : 
                                         order.status === 'CANCELLED' ? 'Cancelado' : 'Pendiente'}
                                    </span>
                                </td>
                                <td className="p-6 align-middle hidden md:table-cell">
                                    <div className="flex items-center text-slate-500 text-sm font-medium">
                                        <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                                        {format(new Date(order.startDate), "dd MMM yyyy", { locale: es })}
                                    </div>
                                </td>
                                <td className="p-4 md:p-6 align-middle text-right font-black text-slate-800 text-sm">
                                    ${order.totalAmount.toLocaleString("es-CL")}
                                </td>
                                <td className="p-4 md:p-6 align-middle text-right space-x-1">
                                    <Link href={`/${slug}/orders/${order.id}`}>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link href={`/${slug}/orders/${order.id}/print`} target="_blank" className="hidden lg:inline-flex">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-slate-100">
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}