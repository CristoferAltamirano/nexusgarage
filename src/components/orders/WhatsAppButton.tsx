'use client';

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface Props {
  phone: string;
  customerName: string;
  vehicleModel: string;
  status: string;
  total: number;
}

export function WhatsAppButton({ phone, customerName, vehicleModel, status, total }: Props) {
  
  const handleSend = () => {
    const cleanPhone = phone.replace(/\D/g, ''); 
    
    let message = `Hola ${customerName}, te escribimos de Taller Demo. `;
    
    if (status === 'COMPLETED') {
        message += `Tu ${vehicleModel} ya está listo para retiro. El total es $${total.toLocaleString()}.`;
    } else if (status === 'IN_PROGRESS') {
        message += `Tu ${vehicleModel} ya está siendo revisado por nuestros técnicos.`;
    } else {
        message += `Hemos recibido tu ${vehicleModel} correctamente. Orden de trabajo generada.`;
    }

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Button 
      onClick={handleSend}
      className="bg-green-600 hover:bg-green-700 text-white gap-2"
    >
      <MessageCircle size={18} />
      Avisar por WhatsApp
    </Button>
  );
}