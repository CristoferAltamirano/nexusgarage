import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
// CORRECCIÓN: Importamos History como HistoryIcon para evitar conflicto
import { User, Car, Wrench, Phone, Mail, MapPin, ArrowLeft, History as HistoryIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ slug: string; customerId: string }>;
}

export default async function CustomerProfilePage(props: Props) {
  const params = await props.params;

  // 1. Buscamos al cliente con TODO su historial
  const customer = await db.customer.findUnique({
    where: { id: params.customerId },
    include: {
        vehicles: {
            include: {
                workOrders: {
                    orderBy: { createdAt: 'desc' } // Órdenes más nuevas primero
                }
            }
        }
    }
  });

  if (!customer) return notFound();

  // Aplanamos todas las órdenes de todos los vehículos
  const allOrders = customer.vehicles.flatMap(v => 
    v.workOrders.map(o => ({ ...o, vehicleName: `${v.brand} ${v.model}` }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-6xl mx-auto">
      
      {/* Botón Volver */}
      <Link href={`/${params.slug}/customers`} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" /> Volver a Clientes
      </Link>

      {/* TARJETA DEL CLIENTE */}
      <div className="bg-white rounded-xl border shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-6">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold">
                    {customer.firstName[0]}{customer.lastName[0]}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{customer.firstName} {customer.lastName}</h1>
                    <div className="flex items-center gap-2 text-slate-500 mt-1">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-sm">{customer.taxId || "S/N"}</span>
                        {customer.isCompany && <Badge variant="secondary">Empresa</Badge>}
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col gap-2 text-sm text-slate-600 min-w-[200px]">
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-indigo-500" /> {customer.phone}
                </div>
                {customer.email && (
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-indigo-500" /> {customer.email}
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-500" /> {customer.address || "Sin dirección"}
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: FLOTA (VEHÍCULOS) */}
        <div className="space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
                <Car className="h-5 w-5" /> Vehículos ({customer.vehicles.length})
            </h3>
            {customer.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-slate-50 border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-bold text-slate-900">{vehicle.brand} {vehicle.model}</div>
                            <div className="text-xs font-mono bg-white border px-1.5 py-0.5 rounded inline-block mt-1">
                                {vehicle.plateOrSerial}
                            </div>
                        </div>
                        <Wrench className="h-4 w-4 text-slate-300" />
                    </div>
                    {vehicle.notes && (
                        <p className="text-xs text-slate-500 italic border-t pt-2 mt-2">
                            "{vehicle.notes}"
                        </p>
                    )}
                </div>
            ))}
            {customer.vehicles.length === 0 && (
                <div className="text-sm text-slate-500 italic">Este cliente no tiene vehículos activos.</div>
            )}
        </div>

        {/* COLUMNA DERECHA: HISTORIAL DE ÓRDENES */}
        <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
                {/* CORRECCIÓN: Usamos HistoryIcon en vez de History */}
                <HistoryIcon className="h-5 w-5" /> Historial de Reparaciones
            </h3>
            
            <div className="bg-white border rounded-xl overflow-hidden">
                {allOrders.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No hay historial de órdenes para este cliente.
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b text-slate-500">
                            <tr>
                                <th className="p-4">Orden</th>
                                <th className="p-4">Vehículo</th>
                                <th className="p-4">Servicio / Nota</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4 text-right">Monto</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {allOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-mono font-medium">#{order.number}</td>
                                    <td className="p-4 text-slate-600">{order.vehicleName}</td>
                                    <td className="p-4">
                                        <div className="line-clamp-1 max-w-[200px]" title={order.description}>
                                            {order.description}
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-500">
                                        {format(order.startDate, "dd/MM/yy", { locale: es })}
                                    </td>
                                    <td className="p-4 text-right font-medium">
                                        ${order.totalAmount.toLocaleString("es-CL")}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link href={`/${params.slug}/orders/${order.id}`}>
                                            <Button size="sm" variant="ghost">Ver</Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}