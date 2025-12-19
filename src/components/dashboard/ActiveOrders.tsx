import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Wrench } from "lucide-react";
import Link from "next/link"; // <--- IMPORTANTE

interface Props {
  orders: {
    id: string;
    number: number;
    description: string;
    status: string;
    startDate: Date;
    vehicle: {
        brand: string;
        model: string;
        plateOrSerial: string;
    };
    vehicleId: string;
    // Necesitamos el slug para armar el link, pero vendrá implícito en la URL si usamos rutas relativas,
    // o mejor lo pedimos explicitamente si es necesario. Por ahora usaremos la prop que falta.
  }[];
  // Agregamos slug aquí para poder armar el link correctamente
  slug?: string; 
}

export function ActiveOrders({ orders, slug }: Props) {
  
  const getStatusBadge = (status: string) => {
    switch(status) {
        case 'PENDING': return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 gap-1"><Clock size={12}/> Pendiente</Badge>;
        case 'IN_PROGRESS': return <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 gap-1"><Wrench size={12}/> En Taller</Badge>;
        case 'COMPLETED': return <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1"><CheckCircle size={12}/> Listo</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-lg">Órdenes Activas</h3>
        <span className="text-xs text-slate-400 font-mono">Últimas 10</span>
      </div>
      
      <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
        {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-40">
                <Wrench className="w-8 h-8 text-slate-300 mb-2" />
                <p>No hay trabajos pendientes.</p>
            </div>
        ) : (
            orders.map(order => (
                // AQUI ESTA EL CAMBIO: El Link envuelve todo
                <Link 
                    href={`/${slug || 'demo'}/orders/${order.id}`} 
                    key={order.id} 
                    className="block p-4 hover:bg-slate-50 transition group cursor-pointer"
                >
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#{order.number}</span>
                                <h4 className="font-semibold text-slate-700 group-hover:text-indigo-600 transition">
                                    {order.vehicle.brand} {order.vehicle.model}
                                </h4>
                            </div>
                            <p className="text-sm text-slate-500 line-clamp-1 mb-1">
                                {order.description}
                            </p>
                            <p className="text-xs text-slate-400">
                                Ingreso: {new Date(order.startDate).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(order.status)}
                            <span className="text-xs text-slate-500 font-medium">
                                {order.vehicle.plateOrSerial}
                            </span>
                        </div>
                    </div>
                </Link>
            ))
        )}
      </div>
    </div>
  );
}