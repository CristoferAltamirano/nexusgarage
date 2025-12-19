import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Car, Phone, Mail, User } from "lucide-react";
import { CreateCustomerDialog } from "@/components/dashboard/CreateCustomerDialog"; 
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function CustomersPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  const tenant = await db.tenant.findUnique({ where: { slug: params.slug } });
  if (!tenant) return <div>Error: Taller no encontrado</div>;

  const customers = await db.customer.findMany({
    where: {
      tenantId: tenant.id,
      deletedAt: null, 
      OR: query ? [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { taxId: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ] : undefined
    },
    include: {
      _count: { select: { vehicles: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50 
  });

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">

      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Clientes</h2>
          <p className="text-slate-500 text-sm mt-1">Base de datos de tus clientes.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                name="q" 
                placeholder="Nombre, RUT o Email..." 
                className="pl-10 h-10 w-full bg-white" 
                defaultValue={query} 
            />
          </div>
          <CreateCustomerDialog tenantId={tenant.id} slug={params.slug} />
        </div>
      </div>

      {/* TABLA RESPONSIVA */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                {/* CLIENTE: Visible siempre */}
                <th className="h-10 px-4 md:px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs">
                    Cliente
                </th>
                
                {/* ID: Oculto en celular (hidden md:table-cell) */}
                <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden md:table-cell">
                    Identificación
                </th>
                
                {/* CONTACTO: Oculto en celular (hidden lg:table-cell) - Solo visible en pantallas grandes */}
                <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden lg:table-cell">
                    Contacto
                </th>
                
                {/* VEHÍCULOS: Visible siempre, pero centrado */}
                <th className="h-10 px-4 md:px-6 text-center align-middle font-medium text-slate-500 uppercase text-xs">
                    <span className="md:hidden"><Car className="h-4 w-4 mx-auto"/></span> {/* Icono solo en movil */}
                    <span className="hidden md:inline">Vehículos</span> {/* Texto en PC */}
                </th>
                
                <th className="h-10 px-4 md:px-6 text-right w-[80px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                        No se encontraron clientes.
                    </td>
                </tr>
              )}
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* COLUMNA 1: Nombre (Visible siempre) */}
                  <td className="p-4 md:p-6 align-middle">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 min-w-[36px] rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm truncate max-w-[150px] md:max-w-none">
                                {customer.firstName} {customer.lastName}
                            </span>
                            {/* En móvil mostramos el teléfono aquí porque ocultamos la columna contacto */}
                            <span className="text-xs text-slate-500 lg:hidden flex items-center gap-1">
                                <Phone className="h-3 w-3"/> {customer.phone}
                            </span>
                        </div>
                    </div>
                  </td>

                  {/* COLUMNA 2: ID (Solo PC) */}
                  <td className="p-6 align-middle text-slate-600 font-mono text-xs hidden md:table-cell">
                    {customer.taxId || "---"}
                  </td>

                  {/* COLUMNA 3: Contacto (Solo Pantallas Grandes) */}
                  <td className="p-6 align-middle hidden lg:table-cell">
                    <div className="flex flex-col gap-1 text-xs text-slate-500">
                        <div className="flex items-center"><Phone className="h-3 w-3 mr-1.5 opacity-70" /> {customer.phone}</div>
                        {customer.email && <div className="flex items-center"><Mail className="h-3 w-3 mr-1.5 opacity-70" /> {customer.email}</div>}
                    </div>
                  </td>

                  {/* COLUMNA 4: Vehículos */}
                  <td className="p-4 md:p-6 align-middle text-center">
                    <span className="inline-flex items-center bg-slate-100 px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-700">
                        <Car className="h-3 w-3 mr-1 md:block hidden" /> {/* Icono solo en PC */}
                        {customer._count.vehicles}
                    </span>
                  </td>

                  {/* COLUMNA 5: Botón Editar */}
                  <td className="p-4 md:p-6 align-middle text-right">
                    <Button size="sm" variant="ghost" className="h-8 text-xs">Editar</Button>
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