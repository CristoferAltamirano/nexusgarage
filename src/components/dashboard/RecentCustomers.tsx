import { User, Car } from "lucide-react";
// 1. IMPORTAMOS EL NUEVO COMPONENTE
import { AddVehicleDialog } from "./AddVehicleDialog";

interface Props {
  // 2. AGREGAMOS 'slug' A LAS PROPS PORQUE LO NECESITAMOS PARA EL BOTÓN
  slug: string; 
  customers: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    createdAt: Date;
    tenantId: string; // Asegúrate de que Prisma traiga esto (generalmente lo hace por defecto)
    _count: {
        vehicles: number;
    }
  }[];
}

export function RecentCustomers({ customers, slug }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="font-bold text-slate-800 text-lg">Clientes Recientes</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Contacto</th>
              <th className="px-6 py-3 text-center">Vehículos</th>
              <th className="px-6 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No hay clientes registrados aún.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="bg-white border-b hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <User size={16} />
                    </div>
                    {customer.firstName} {customer.lastName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex flex-col">
                        <span>{customer.phone}</span>
                        <span className="text-xs text-slate-400">{customer.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        <Car size={12} />
                        {customer._count.vehicles}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* 3. AQUÍ USAMOS EL COMPONENTE NUEVO */}
                    <AddVehicleDialog 
                      customerId={customer.id} 
                      tenantId={customer.tenantId} 
                      slug={slug} 
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}