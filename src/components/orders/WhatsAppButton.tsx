"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner"; // Asumo que usas Sonner o use-toast

interface WhatsAppButtonProps {
  phone: string | null; // Puede ser null
  customerName: string;
  vehicleModel: string; // Ej: "Toyota Yaris"
  status: string;       // Ej: "COMPLETED"
  orderNumber: number;  // Ej: 1005
}

export default function WhatsAppButton({
  phone,
  customerName,
  vehicleModel,
  status,
  orderNumber
}: WhatsAppButtonProps) {

  const handleClick = () => {
    if (!phone) {
      toast.error("El cliente no tiene teléfono registrado.");
      return;
    }

    // 1. Limpieza y validación de número (Lógica Chile 🇨🇱)
    // Quitamos espacios, guiones, paréntesis
    let cleanPhone = phone.replace(/\D/g, "");

    // Si tiene 9 dígitos (ej: 912345678), le agregamos el 56
    if (cleanPhone.length === 9) {
      cleanPhone = `56${cleanPhone}`;
    }
    // Si tiene 8 dígitos (fijo antiguo o error), intentamos arreglarlo o lo dejamos pasar
    else if (cleanPhone.length === 8) {
      cleanPhone = `569${cleanPhone}`; 
    }

    // 2. Generación del Mensaje Inteligente
    const nombre = customerName.split(" ")[0]; // Solo primer nombre para ser amigable
    let message = "";

    switch (status) {
      case "COMPLETED":
        message = `Hola ${nombre} 👋, te escribimos de NexusGarage. Tu *${vehicleModel}* (Orden #${orderNumber}) ya está listo ✅. Puedes pasar a retirarlo cuando gustes.`;
        break;
      case "DELIVERED":
        message = `Hola ${nombre}, gracias por confiar en NexusGarage para tu *${vehicleModel}*. ¡Esperamos que todo ande bien! 🚗💨`;
        break;
      case "WAITING_PARTS":
        message = `Hola ${nombre}, te informamos sobre tu *${vehicleModel}*. Estamos a la espera de unos repuestos para continuar 🛠️. Te avisaremos apenas lleguen.`;
        break;
      case "IN_PROGRESS":
        message = `Hola ${nombre}, tu *${vehicleModel}* ya está en proceso de reparación en NexusGarage 🔧. Te mantendremos informado.`;
        break;
      default: // PENDING u otros
        message = `Hola ${nombre}, te escribimos de NexusGarage respecto a la orden #${orderNumber} de tu *${vehicleModel}*.`;
    }

    // 3. Abrir WhatsApp
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleClick} 
      className="gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all"
      title="Enviar mensaje por WhatsApp"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">WhatsApp</span>
    </Button>
  );
}