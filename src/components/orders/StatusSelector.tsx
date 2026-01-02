"use client";

import { useState, useEffect } from "react";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { updateOrderStatus } from "@/actions/orders";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { 
    Loader2, Clock, Wrench, Package, CheckCircle2, UserCheck, XCircle, MessageCircle, Send
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
    orderId: string;
    currentStatus: string;
    customerName?: string;
    customerPhone?: string | null;
    vehicleInfo?: string;
    orderNumber?: number;
    tenantName?: string;
}

export function StatusSelector({ 
    orderId, 
    currentStatus, 
    customerName = "Cliente", 
    customerPhone, 
    vehicleInfo = "su vehículo",
    orderNumber,
    tenantName = "nuestro taller"
}: Props) {
    const [isPending, setIsPending] = useState(false);
    const [status, setStatus] = useState(currentStatus);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [messageToEdit, setMessageToEdit] = useState("");
    const [origin, setOrigin] = useState("");

    const pathname = usePathname();
    const slug = pathname.split("/")[1];

    useEffect(() => {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
    }, []);

    // 🛠️ Generador de Texto Base
    const generateBaseMessage = (newStatus: string) => {
        const nombre = customerName.split(" ")[0];
        
        switch (newStatus) {
            case "COMPLETED":
                return `Hola ${nombre} 👋, te escribimos de ${tenantName}. Tu *${vehicleInfo}* (Orden #${orderNumber}) ya está listo ✅. Puedes pasar a retirarlo cuando gustes.`;
            case "IN_PROGRESS":
                return `Hola ${nombre}, te contamos que en ${tenantName} ya comenzamos a trabajar en tu *${vehicleInfo}* 🔧. Te mantendremos informado.`;
            case "WAITING_PARTS":
                return `Hola ${nombre}, te informamos que estamos esperando repuestos para tu *${vehicleInfo}* 📦. El trabajo se reanudará apenas lleguen.`;
            
            case "DELIVERED":
                const voucherLink = origin ? `${origin}/${slug}/orders/${orderId}/print` : "[Link no disponible]";
                return `Hola ${nombre}, gracias por confiar en ${tenantName}. ¡Que disfrutes tu *${vehicleInfo}*! 🚗💨.\n\n📄 Aquí tienes el respaldo digital de tu orden: ${voucherLink}`;
            
            case "CANCELLED":
                return `Hola ${nombre}, te informamos que la orden #${orderNumber} para tu *${vehicleInfo}* ha sido cancelada 🚫. Por favor contáctanos si tienes dudas.`;
            default:
                return `Hola ${nombre}, te contactamos de ${tenantName} por tu vehículo *${vehicleInfo}*.`;
        }
    };

    // ✅ LÓGICA DE ENVÍO "INTERNATIONAL FRIENDLY"
    const handleSendWhatsApp = () => {
        if (!customerPhone) return;
        
        // 1. Limpiamos caracteres no numéricos
        let cleanPhone = customerPhone.replace(/\D/g, "");

        // 2. Regla especial para Chile (Legacy Support):
        // Si el número es corto (8 o 9 dígitos) y NO empieza con 56, asumimos que es un móvil chileno local
        // y le agregamos el prefijo para que el link funcione.
        if (!cleanPhone.startsWith("56") && (cleanPhone.length === 9 || cleanPhone.length === 8)) {
             if (cleanPhone.length === 9) cleanPhone = `56${cleanPhone}`;      // Ej: 912345678 -> 56912345678
             else if (cleanPhone.length === 8) cleanPhone = `569${cleanPhone}`; // Ej: 99345678 -> 56999345678
        }
        
        // NOTA: Para cualquier otro país (Argentina 54, Perú 51, etc.), asumimos que el usuario
        // guardó el número completo con código de país o que tiene más de 10 dígitos.
        // En esos casos, no tocamos el número y lo mandamos tal cual a la API de WhatsApp.

        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageToEdit)}`;
        window.open(url, "_blank");
        setIsDialogOpen(false);
    };

    const handleStatusChange = async (newStatus: string) => {
        setStatus(newStatus); 
        setIsPending(true);

        try {
            const res = await updateOrderStatus(orderId, newStatus, slug);
            
            if (res.success) {
                const baseMessage = generateBaseMessage(newStatus);
                
                toast.success("Estado actualizado", {
                    description: customerPhone ? "¿Quieres avisar al cliente?" : undefined,
                    action: customerPhone ? {
                        label: "Redactar WhatsApp",
                        onClick: () => {
                            setMessageToEdit(baseMessage);
                            setIsDialogOpen(true);
                        },
                    } : undefined,
                    duration: 5000,
                });

            } else {
                toast.error(res.error || "No se pudo actualizar");
                setStatus(currentStatus); 
            }
        } catch (error) {
            toast.error("Error de conexión");
            setStatus(currentStatus); 
        } finally {
            setIsPending(false);
        }
    };

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
        <>
            <div className="flex items-center gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                
                <Select 
                    value={status} 
                    onValueChange={handleStatusChange} 
                    disabled={isPending}
                >
                    <SelectTrigger className={`w-full sm:w-[210px] h-10 font-medium border transition-colors ${getStatusColor(status)}`}>
                        <div className="flex items-center truncate">
                            {getStatusIcon(status)}
                            <SelectValue placeholder="Estado" />
                        </div>
                    </SelectTrigger>
                    
                    <SelectContent>
                        <SelectItem value="PENDING"><div className="flex items-center text-yellow-600 font-medium"><Clock className="h-4 w-4 mr-2" /> Pendiente</div></SelectItem>
                        <SelectItem value="IN_PROGRESS"><div className="flex items-center text-blue-600 font-medium"><Wrench className="h-4 w-4 mr-2" /> En Taller</div></SelectItem>
                        <SelectItem value="WAITING_PARTS"><div className="flex items-center text-orange-600 font-medium"><Package className="h-4 w-4 mr-2" /> Esperando Repuestos</div></SelectItem>
                        <SelectItem value="COMPLETED"><div className="flex items-center text-green-600 font-medium"><CheckCircle2 className="h-4 w-4 mr-2" /> Terminado</div></SelectItem>
                        <SelectItem value="DELIVERED"><div className="flex items-center text-slate-600 font-medium"><UserCheck className="h-4 w-4 mr-2" /> Entregado</div></SelectItem>
                        <SelectItem value="CANCELLED"><div className="flex items-center text-red-600 font-medium"><XCircle className="h-4 w-4 mr-2" /> Cancelado</div></SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-green-600" />
                            Confirmar Mensaje
                        </DialogTitle>
                        <DialogDescription>
                            Puedes editar el mensaje antes de enviarlo por WhatsApp.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-2">
                        <Textarea 
                            value={messageToEdit}
                            onChange={(e) => setMessageToEdit(e.target.value)}
                            className="min-h-[150px] text-sm font-mono bg-slate-50"
                            placeholder="Escribe tu mensaje..."
                        />
                    </div>

                    <DialogFooter className="flex-row justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSendWhatsApp} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                            <Send className="h-4 w-4" /> Enviar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}