import { db } from "@/lib/db";
import { CreateVehicleDialog } from "@/components/dashboard/CreateVehicleDialog"; 
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, CarFront, Eye, User } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function VehiclesPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  const tenant = await db.tenant.findUnique({ where: { slug: params.slug } });
  if (!tenant) return <div>Error: Taller no encontrado</div>;

  const vehicles = await db.vehicle.findMany({
    where: {
      tenantId: tenant.id,
      deletedAt: null, 
      OR: query ? [
        { plateOrSerial: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { model: { contains: query, mode: 'insensitive' } },
        { customer: { firstName: { contains: query, mode: 'insensitive' } } },
        { customer: { lastName: { contains: query, mode: 'insensitive' } } },
      ] : undefined
    },
    orderBy: { createdAt: "desc" },
    take: 50, 
    include: {
      customer: true,
      _count: { select: { workOrders: true } }
    }
  });

  const customers = await db.customer.findMany({
    where: { tenantId: tenant.id, deletedAt: null },
    select: { id: true, firstName: true, lastName: true, taxId: true },
    orderBy: { firstName: 'asc' },
    take: 100
  });

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">

      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Flota de Vehículos</h2>
          <p className="text-slate-500 text-sm mt-1">Administra los autos y motos.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                name="q" 
                placeholder="Patente, modelo..." 
                className="pl-10 h-10 w-full bg-white" 
                defaultValue={query} 
            />
          </div>
          <div className="shrink-0">
            <CreateVehicleDialog tenantId={tenant.id} slug={params.slug} customers={customers} />
          </div>
        </div>
      </div>

      {/* TABLA RESPONSIVA */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                {/* PATENTE: Visible siempre */}
                <th className="h-10 px-4 md:px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs">
                    Patente
                </th>
                
                {/* VEHÍCULO: Visible siempre */}
                <th className="h-10 px-4 md:px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs">
                    Vehículo
                </th>
                
                {/* DUEÑO: Oculto en celular (hidden md:table-cell) */}
                <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden md:table-cell">
                    Dueño
                </th>
                
                {/* TIPO: Oculto en Tablet y Celular (hidden lg:table-cell) */}
                <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden lg:table-cell">
                    Tipo
                </th>
                
                {/* ÓRDENES: Oculto en Laptops pequeñas y celular (hidden xl:table-cell) */}
                <th className="h-10 px-6 text-right align-middle font-medium text-slate-500 uppercase text-xs hidden xl:table-cell">
                    Órdenes
                </th>
                
                <th className="h-10 px-4 md:px-6 w-[60px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <CarFront className="h-10 w-10 mb-2 opacity-20" />
                            <p>No se encontraron vehículos.</p>
                        </div>
                    </td>
                </tr>
              )}
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* COLUMNA 1: Patente */}
                  <td className="p-4 md:p-6 align-middle">
                    <span className="font-mono font-bold text-xs md:text-sm bg-slate-100 border border-slate-300 px-2 py-1 rounded text-slate-800 uppercase shadow-sm whitespace-nowrap">
                      {vehicle.plateOrSerial}
                    </span>
                  </td>

                  {/* COLUMNA 2: Vehículo (+ Dueño en móvil) */}
                  <td className="p-4 md:p-6 align-middle">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm capitalize">
                        {vehicle.brand} {vehicle.model}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {vehicle.color || "Sin color"}
                      </span>
                      
                      {/* TRUCO: Mostramos el dueño AQUÍ solo en celular (md:hidden) */}
                      <div className="md:hidden flex items-center gap-1 mt-1 text-xs text-indigo-600 font-medium">
                        <User className="h-3 w-3" />
                        {vehicle.customer.firstName} {vehicle.customer.lastName}
                      </div>
                    </div>
                  </td>

                  {/* COLUMNA 3: Dueño (Solo PC/Tablet) */}
                  <td className="p-6 align-middle hidden md:table-cell">
                    <Link href={`/${params.slug}/customers/${vehicle.customerId}`} className="flex items-center gap-2 group/link">
                      <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold group-hover/link:bg-indigo-100 transition-colors">
                        {vehicle.customer.firstName[0]}{vehicle.customer.lastName[0]}
                      </div>
                      <span className="font-medium text-slate-700 group-hover/link:text-indigo-700 transition-colors text-sm">
                        {vehicle.customer.firstName} {vehicle.customer.lastName}
                      </span>
                    </Link>
                  </td>

                  {/* COLUMNA 4: Tipo (Solo PC Grande) */}
                  <td className="p-6 align-middle hidden lg:table-cell">
                    <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700">
                        {vehicle.type === 'CAR' ? 'Auto' : 'Moto'}
                    </Badge>
                  </td>

                  {/* COLUMNA 5: Conteo Órdenes (Solo PC Extra Grande) */}
                  <td className="p-6 align-middle text-right font-medium text-slate-600 hidden xl:table-cell">
                    {vehicle._count.workOrders}
                  </td>

                  {/* COLUMNA 6: Botón Ver */}
                  <td className="p-4 md:p-6 align-middle text-right">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400">
                      <Eye className="h-4 w-4" />
                    </Button>
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