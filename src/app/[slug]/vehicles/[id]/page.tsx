import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Car, Calendar, FileText, User, Settings, AlertCircle } from "lucide-react";

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

export default async function VehicleDetailPage(props: Props) {
  const params = await props.params;

  const tenant = await db.tenant.findUnique({ where: { slug: params.slug } });
  if (!tenant) return <div>Error: Taller no encontrado</div>;

  const vehicle = await db.vehicle.findUnique({
    where: { id: params.id },
    include: {
        customer: true,
        workOrders: {
            orderBy: { createdAt: 'desc' }
        }
    }
  });

  if (!vehicle) return notFound();

  return (
    // CLAVE: w-full y max-w-[100vw] evitan que la página entera se ensanche
    <div className="w-full max-w-[100vw] flex-1 space-y-6 p-4 md:p-8 pt-6 pb-20 overflow-x-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
            <Link href={`/${params.slug}/vehicles`}>
                <Button variant="outline" size="icon" className="rounded-full h-8 w-8 shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <div className="overflow-hidden">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight flex flex-wrap items-center gap-2">
                    <span className="truncate max-w-[200px] sm:max-w-none">{vehicle.brand} {vehicle.model}</span>
                    <Badge className="text-sm px-2 py-0.5 whitespace-nowrap" variant="secondary">
                        {vehicle.plateOrSerial}
                    </Badge>
                </h2>
                <p className="text-slate-500 text-sm truncate">Ficha técnica e historial.</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TARJETA 1: DATOS */}
        <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-3 bg-slate-50/50 border-b">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                    <Car className="h-3.5 w-3.5" /> Datos del Vehículo
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">Patente</span>
                    <span className="font-mono font-bold text-slate-900">{vehicle.plateOrSerial}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-500 text-sm">Modelo</span>
                    <span className="font-medium text-slate-900 truncate max-w-[150px] text-right">{vehicle.brand} {vehicle.model}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Color</span>
                    <span className="font-medium capitalize text-slate-900">{vehicle.color || "---"}</span>
                </div>
            </CardContent>
        </Card>

        {/* TARJETA 2: DUEÑO */}
        <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-3 bg-slate-50/50 border-b">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                    <User className="h-3.5 w-3.5" /> Propietario
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {vehicle.customer.firstName[0]}
                    </div>
                    <div className="overflow-hidden min-w-0">
                        <p className="font-bold text-slate-900 truncate block">
                            {vehicle.customer.firstName} {vehicle.customer.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate block">{vehicle.customer.email}</p>
                    </div>
                </div>
                <div className="flex justify-between pt-2">
                    <span className="text-slate-500 text-sm">Teléfono</span>
                    <span className="font-medium text-slate-900">{vehicle.customer.phone}</span>
                </div>
            </CardContent>
        </Card>
        
        {/* TARJETA 3: ACCIONES */}
        <Card className="bg-slate-50 border-dashed shadow-sm">
             <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
                    <Settings className="h-3.5 w-3.5" /> Acciones Rápidas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-slate-900">{vehicle.workOrders.length}</span>
                    <span className="text-sm text-slate-500">servicios totales</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Historial registrado.</p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm" asChild>
                    <Link href={`/${params.slug}/orders?new=true&vehicleId=${vehicle.id}`}>
                        + Nueva Orden
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>

      {/* SECCIÓN HISTORIAL */}
      <div className="space-y-4 w-full">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" /> Historial de Servicios
        </h3>
        
        <div className="rounded-lg border bg-white shadow-sm overflow-hidden w-full">
            {/* AQUÍ USAMOS LA CLASE DE GLOBALS.CSS */}
            <div className="table-responsive-wrapper">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="h-10 px-4 text-left font-medium text-slate-500 w-[100px]">Orden #</th>
                            <th className="h-10 px-4 text-left font-medium text-slate-500 w-[120px]">Fecha</th>
                            <th className="h-10 px-4 text-left font-medium text-slate-500 w-[120px]">Estado</th>
                            <th className="h-10 px-4 text-left font-medium text-slate-500 min-w-[200px]">Motivo</th>
                            <th className="h-10 px-4 text-right font-medium text-slate-500 w-[120px]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {vehicle.workOrders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center py-6">
                                        <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                                        <p>No hay historial de servicios.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {vehicle.workOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold text-indigo-600 whitespace-nowrap">
                                    #{order.number}
                                </td>
                                <td className="p-4 text-slate-600 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                        {new Date(order.createdAt).toLocaleDateString("es-CL")}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Badge variant="outline" className={
                                        order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 
                                        order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                        'bg-slate-100 text-slate-700 border-slate-200'
                                    }>
                                        {order.status === 'COMPLETED' ? 'Terminado' : 'Pendiente'}
                                    </Badge>
                                </td>
                                <td className="p-4 text-slate-600 truncate max-w-[200px]" title={order.description || ""}>
                                    {order.description || "---"}
                                </td>
                                <td className="p-4 text-right">
                                    <Button size="sm" variant="ghost" className="hover:text-indigo-600" asChild>
                                        <Link href={`/${params.slug}/orders/${order.id}`}>
                                            Ver Detalle
                                        </Link>
                                    </Button>
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