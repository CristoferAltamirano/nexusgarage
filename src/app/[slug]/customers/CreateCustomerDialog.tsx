'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// ✅ CORRECCIÓN: Ruta actualizada a la acción agrupada de clientes
import { createCustomer } from "@/actions/customers"; 
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  tenantId: string;
  slug: string;
}

export default function CreateCustomerDialog({ tenantId, slug }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      // ✅ CORRECCIÓN: Llamamos a la acción desde el archivo centralizado
      const result = await createCustomer(formData);
      
      if (result.success) {
        toast.success("Cliente creado correctamente");
        setOpen(false);
        router.refresh(); // Actualiza la lista de clientes automáticamente
      } else {
        toast.error(result.error || "Error al crear el cliente");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al guardar el cliente");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 font-bold uppercase text-xs">
          <UserPlus size={16} /> Nuevo Cliente
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            Registrar Nuevo Cliente
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="grid gap-4 py-4">
          {/* Campos ocultos de contexto */}
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="slug" value={slug} />

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="font-bold text-slate-500 text-xs uppercase">Nombre *</Label>
              <Input 
                name="firstName" 
                placeholder="Ej: Pedro" 
                required 
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-bold text-slate-500 text-xs uppercase">Apellido *</Label>
              <Input 
                name="lastName" 
                placeholder="Ej: Pascal" 
                required 
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="font-bold text-slate-500 text-xs uppercase">Teléfono / WhatsApp *</Label>
            <Input 
              name="phone" 
              placeholder="Ej: +569 1234 5678" 
              required 
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label className="font-bold text-slate-500 text-xs uppercase">Email (Opcional)</Label>
            <Input 
              name="email" 
              type="email" 
              placeholder="cliente@ejemplo.com" 
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label className="font-bold text-slate-500 text-xs uppercase">Dirección (Opcional)</Label>
            <Input 
              name="address" 
              placeholder="Av. Principal #123" 
              disabled={isLoading}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="bg-indigo-600 hover:bg-indigo-700 w-full mt-2 font-bold uppercase"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cliente"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}