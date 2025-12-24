"use client";

import { useState } from "react";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
// ✅ CORRECCIÓN: Importamos desde el archivo maestro consolidado
import { updateOrderStatus } from "@/actions/orders";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { 
    Loader2, 
    Clock,          // PENDING
    Wrench,         // IN_PROGRESS
    Package,        // WAITING_PARTS
    CheckCircle2,   // COMPLETED
    UserCheck,      // DELIVERED
    XCircle         // CANCELLED
} from "lucide-react";

interface Props {
    orderId: string;
    currentStatus: string;
}

export function StatusSelector({ orderId, currentStatus }: Props) {
    const [isPending, setIsPending] = useState(false);
    const [status, setStatus] = useState(currentStatus); // Estado local para UI optimista
    const pathname = usePathname();
    // Extraemos el slug de la URL actual para pasarlo al servidor
    // pathname suele ser /demo-taller/orders/..., así que el slug es el segmento 1
    const slug = pathname.split("/")[1];

    const handleStatusChange = async (newStatus: string) => {
        // 1. Actualizamos visualmente de inmediato (Optimistic UI)
        setStatus(newStatus); 
        
        // 2. Iniciamos la petición
        setIsPending(true);
        try {
            // ✅ Llamada a la acción corregida con el slug
            const res = await updateOrderStatus(orderId, newStatus, slug);
            
            if (res.success) {
                toast.success("Estado actualizado");
            } else {
                toast.error(res.error || "No se pudo actualizar");
                setStatus(currentStatus); // Revertimos si el servidor dice que no
            }
        } catch (error) {
            toast.error("Error de conexión");
            setStatus(currentStatus); // Revertimos si falla la red
        } finally {
            setIsPending(false);
        }
    };

    // Helper para colores (Borde, Fondo y Texto)
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'PENDING': return 'text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
            case 'IN_PROGRESS': return 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100';
            case 'WAITING_PARTS': return 'text-orange-700 bg-orange-50 border-orange-200 hover:bg-orange-100';
            case 'COMPLETED': return 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100';
            case 'DELIVERED': return 'text-slate-700 bg-slate-100 border-slate-300 hover:bg-slate-200';
            case 'CANCELLED': return 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100';
            default: return 'text-slate-600 border-slate-200';
        }
    };

    // Helper para Iconos
    const getStatusIcon = (s: string) => {
        const className = "h-4 w-4 mr-2 shrink-0";
        switch (s) {
            case 'PENDING': return <Clock className={className} />;
            case 'IN_PROGRESS': return <Wrench className={className} />;
            case 'WAITING_PARTS': return <Package className={className} />;
            case 'COMPLETED': return <CheckCircle2 className={className} />;
            case 'DELIVERED': return <UserCheck className={className} />;
            case 'CANCELLED': return <XCircle className={className} />;
            default: return null;
        }
    };

    return (
        <div className="flex items-center gap-2">
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            
            <Select 
                value={status} 
                onValueChange={handleStatusChange} 
                disabled={isPending}
            >
                <SelectTrigger className={`w-[210px] h-10 font-medium border transition-colors ${getStatusColor(status)}`}>
                    <div className="flex items-center truncate">
                        {getStatusIcon(status)}
                        <SelectValue placeholder="Estado" />
                    </div>
                </SelectTrigger>
                
                <SelectContent>
                    <SelectItem value="PENDING">
                        <div className="flex items-center text-yellow-600 font-medium">
                            <Clock className="h-4 w-4 mr-2" /> Pendiente
                        </div>
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS">
                        <div className="flex items-center text-blue-600 font-medium">
                            <Wrench className="h-4 w-4 mr-2" /> En Taller
                        </div>
                    </SelectItem>
                    <SelectItem value="WAITING_PARTS">
                        <div className="flex items-center text-orange-600 font-medium">
                            <Package className="h-4 w-4 mr-2" /> Esperando Repuestos
                        </div>
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                        <div className="flex items-center text-green-600 font-medium">
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Terminado
                        </div>
                    </SelectItem>
                    <SelectItem value="DELIVERED">
                        <div className="flex items-center text-slate-600 font-medium">
                            <UserCheck className="h-4 w-4 mr-2" /> Entregado
                        </div>
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                        <div className="flex items-center text-red-600 font-medium">
                            <XCircle className="h-4 w-4 mr-2" /> Cancelado
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}