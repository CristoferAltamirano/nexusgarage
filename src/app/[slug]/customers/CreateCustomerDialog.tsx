"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 🔥 Para refrescar la lista sin recargar
import { createCustomer } from "@/actions/create-customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner"; 

interface Props {
  tenantId: string;
  slug: string;
}

export function CreateCustomerDialog({ tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); 

  // Usamos onSubmit estándar para tener control total del Loader y el cierre
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // 1. Evita recarga del navegador
    setIsLoading(true); // 2. Activa el spinner

    const formData = new FormData(e.currentTarget);

    try {
        // 3. Llamamos al Server Action
        await createCustomer(formData);

        // 4. ✅ ÉXITO
        toast.success("Cliente guardado exitosamente");
        
        // 5. Refrescamos la data de la página de atrás (la tabla de clientes)
        router.refresh(); 

        // 6. Cerramos el modal suavemente
        setOpen(false);

    } catch (error) {
        // ❌ ERROR
        console.error(error);
        toast.error("Ocurrió un error al guardar");
    } finally {
        // 7. Apagamos el spinner pase lo que pase
        setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <UserPlus className="mr-2 h-4 w-4" /> Nuevo Cliente
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 mt-2">
            {/* Campos ocultos necesarios para la Server Action */}
            <input type="hidden" name="tenantId" value={tenantId} />
            <input type="hidden" name="slug" value={slug} />

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input name="firstName" placeholder="Juan" required />
                </div>
                <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input name="lastName" placeholder="Pérez" required />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>RUT / DNI</Label>
                    <Input name="taxId" placeholder="12.345.678-9" required />
                </div>
                <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input name="phone" placeholder="+56 9..." required />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Email (Opcional)</Label>
                <Input name="email" type="email" placeholder="juan@gmail.com" />
            </div>

            <div className="space-y-2">
                <Label>Dirección (Opcional)</Label>
                <Input name="address" placeholder="Av. Siempre Viva 123" />
            </div>
            
            <div className="flex items-center space-x-2 pt-2 border p-3 rounded-md bg-slate-50">
                <Checkbox id="isCompany" name="isCompany" />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="isCompany" className="font-medium cursor-pointer">
                        Es una Empresa
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Marca esto si requiere factura a nombre de razón social.
                    </p>
                </div>
            </div>

            <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-4"
                disabled={isLoading}
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