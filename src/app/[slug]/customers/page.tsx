import { db } from "@/lib/db";
// Asegúrate de que esta ruta sea correcta según donde guardaste el componente de crear
import { CreateCustomerDialog } from "@/components/dashboard/CreateCustomerDialog"; 
// 👇 IMPORTAMOS LOS MODALES DE EDICIÓN Y ELIMINACIÓN
import { EditCustomerDialog } from "@/components/customers/EditCustomerDialog";
import { DeleteCustomerButton } from "@/components/customers/DeleteCustomerButton";
import { Button } from "@/components/ui/button";
import { Car, Phone, Mail, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Search from "@/components/ui/search"; 

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CustomersPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  // Manejo seguro del query param para el buscador
  const query = typeof searchParams.query === "string" ? searchParams.query : "";

  const tenant = await db.tenant.findUnique({ where: { slug: params.slug } });
  if (!tenant) return <div>Error: Taller no encontrado</div>;

  const customers = await db.customer.findMany({
    where: {
      tenantId: tenant.id,
      deletedAt: null, 
      // Lógica de búsqueda
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
    // 1. CONTENEDOR GLOBAL RESPONSIVO
    <div className="w-full max-w-[100vw] flex-1 space-y-8 p-4 md:p-8 pt-6 pb-20 overflow-x-hidden">

      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Cartera de Clientes</h2>
          <p className="text-slate-500 text-sm mt-1">Administra tus clientes y sus datos.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* BÚSQUEDA */}
          <div className="w-full md:w-80">
             <Search placeholder="Buscar por nombre, RUT..." />
          </div>
          
          {/* MODAL CREAR */}
          <div className="shrink-0">
            <CreateCustomerDialog tenantId={tenant.id} slug={params.slug} />
          </div>
        </div>
      </div>

      {/* TABLA RESPONSIVA */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        
        {/* 2. SCROLL HORIZONTAL SUAVE */}
        <div className="w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
            
          {/* Ancho mínimo para mantener estructura en móviles */}
          <table className="w-full caption-bottom text-sm min-w-[600px] md:min-w-full">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-100">
                {/* CLIENTE */}
                <th className="h-10 px-4 md:px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs">
                    Cliente
                </th>
                
                {/* IDENTIFICACIÓN (Oculto en móvil) */}
                <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden md:table-cell">
                    Identificación
                </th>
                
                {/* CONTACTO (Oculto en móvil/tablet pequeña) */}
                <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden lg:table-cell">
                    Contacto
                </th>
                
                {/* VEHÍCULOS (Centrado) */}
                <th className="h-10 px-4 md:px-6 text-center align-middle font-medium text-slate-500 uppercase text-xs w-[100px]">
                    <span className="md:hidden"><Car className="h-4 w-4 mx-auto"/></span>
                    <span className="hidden md:inline">Vehículos</span>
                </th>
                
                <th className="h-10 px-4 md:px-6 text-right w-[120px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <Users className="h-10 w-10 mb-2 opacity-20" />
                            <p>{query ? "No se encontraron resultados." : "No hay clientes registrados."}</p>
                        </div>
                    </td>
                </tr>
              )}
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* COLUMNA 1: Nombre + Info Móvil */}
                  <td className="p-4 md:p-6 align-middle">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 min-w-[36px] rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {customer.firstName[0]}{customer.lastName[0]}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 text-sm truncate max-w-[150px] sm:max-w-none">
                                {customer.firstName} {customer.lastName}
                            </span>
                            
                            {/* Teléfono visible solo en móvil */}
                            <span className="text-xs text-slate-500 lg:hidden flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3"/> {customer.phone}
                            </span>
                        </div>
                    </div>
                  </td>

                  {/* COLUMNA 2: ID (RUT) - PC */}
                  <td className="p-6 align-middle hidden md:table-cell">
                    <span className="font-mono text-xs bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-600 whitespace-nowrap">
                        {customer.taxId || "---"}
                    </span>
                  </td>

                  {/* COLUMNA 3: Contacto Detallado - PC Grande */}
                  <td className="p-6 align-middle hidden lg:table-cell">
                    <div className="flex flex-col gap-1 text-xs text-slate-500">
                        <div className="flex items-center"><Phone className="h-3 w-3 mr-1.5 opacity-70" /> {customer.phone}</div>
                        {customer.email && <div className="flex items-center truncate max-w-[200px]"><Mail className="h-3 w-3 mr-1.5 opacity-70" /> {customer.email}</div>}
                    </div>
                  </td>

                  {/* COLUMNA 4: Vehículos */}
                  <td className="p-4 md:p-6 align-middle text-center">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0">
                        {customer._count.vehicles} <span className="hidden md:inline ml-1">Autos</span>
                    </Badge>
                  </td>

                  {/* COLUMNA 5: Acciones */}
                  <td className="p-4 md:p-6 align-middle text-right">
                    <div className="flex items-center justify-end gap-1">
                        
                        {/* ✏️ BOTÓN EDITAR */}
                        <EditCustomerDialog 
                            customer={customer} 
                            tenantId={tenant.id} 
                            slug={params.slug} 
                        />
                        
                        {/* 🗑️ BOTÓN ELIMINAR */}
                        <DeleteCustomerButton 
                             id={customer.id} 
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