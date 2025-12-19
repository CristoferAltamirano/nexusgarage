"use client"

import { useState } from "react";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { updateOrderStatus } from "@/actions/update-order-status";
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
    const [status, setStatus] = useState(currentStatus); // Estado local para cambio instantáneo
    const pathname = usePathname();

    const handleStatusChange = async (newStatus: string) => {
        // 1. Actualizamos visualmente al tiro (Optimistic UI)
        setStatus(newStatus); 
        
        // 2. Iniciamos la petición
        setIsPending(true);
        try {
            await updateOrderStatus(orderId, newStatus, pathname);
            toast.success("Estado actualizado");
        } catch (error) {
            toast.error("Error al actualizar");
            setStatus(currentStatus); // Revertimos si falla
        } finally {
            setIsPending(false);
        }
    };

    // Helper para colores (Borde y Texto)
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'PENDING': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            case 'IN_PROGRESS': return 'text-blue-700 bg-blue-50 border-blue-200';
            case 'WAITING_PARTS': return 'text-orange-700 bg-orange-50 border-orange-200';
            case 'COMPLETED': return 'text-green-700 bg-green-50 border-green-200';
            case 'DELIVERED': return 'text-slate-700 bg-slate-100 border-slate-300';
            case 'CANCELLED': return 'text-red-700 bg-red-50 border-red-200';
            default: return 'text-slate-600 border-slate-200';
        }
    };

    // Helper para Iconos
    const getStatusIcon = (s: string) => {
        const className = "h-4 w-4 mr-2 shrink-0"; // Estilo base del icono
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
                <SelectTrigger className={`w-[200px] h-10 font-medium border-2 transition-all ${getStatusColor(status)}`}>
                    {/* Renderizamos manualmente el valor para incluir el icono en el trigger */}
                    <div className="flex items-center">
                        {getStatusIcon(status)}
                        <SelectValue placeholder="Estado" />
                    </div>
                </SelectTrigger>
                
                <SelectContent>
                    <SelectItem value="PENDING">
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-yellow-500" /> Pendiente
                        </div>
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS">
                        <div className="flex items-center">
                            <Wrench className="h-4 w-4 mr-2 text-blue-500" /> En Taller
                        </div>
                    </SelectItem>
                    <SelectItem value="WAITING_PARTS">
                        <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-orange-500" /> Esperando Repuestos
                        </div>
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                        <div className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Terminado
                        </div>
                    </SelectItem>
                    <SelectItem value="DELIVERED">
                        <div className="flex items-center">
                            <UserCheck className="h-4 w-4 mr-2 text-slate-500" /> Entregado
                        </div>
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                        <div className="flex items-center">
                            <XCircle className="h-4 w-4 mr-2 text-red-500" /> Cancelado
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}