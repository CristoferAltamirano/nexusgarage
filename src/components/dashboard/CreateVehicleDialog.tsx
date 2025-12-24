'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVehicle } from "@/actions/create-vehicle";
// 🔥 1. Agregamos Loader2 para la animación
import { CarFront, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  tenantId: string;
  slug: string;
  customers: { id: string; firstName: string; lastName: string; taxId: string | null }[];
}

export function CreateVehicleDialog({ tenantId, slug, customers }: Props) {
  const [open, setOpen] = useState(false);
  // 🔥 2. Estado para controlar la carga
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 3. Función para manejar el envío con animación
  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
        await createVehicle(formData);
        toast.success("Vehículo registrado correctamente");
        setOpen(false);
    } catch (error) {
        toast.error("Error al registrar vehículo");
        console.error(error);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
           <CarFront size={16} /> Nuevo Vehículo
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Vehículo</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="slug" value={slug} />

          {/* Selector de Cliente (Dueño) */}
          <div className="grid gap-2">
            <Label htmlFor="customerId">Dueño del Vehículo *</Label>
            <select name="customerId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Selecciona un cliente...</option>
                {customers.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.taxId || "Sin RUT"})
                    </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input name="brand" placeholder="Toyota" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input name="model" placeholder="Yaris" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
                <Label htmlFor="plateOrSerial">Patente *</Label>
                <Input name="plateOrSerial" placeholder="ABCD-12" required className="uppercase" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <select name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="Auto">Auto</option>
                    <option value="Camioneta">Camioneta/SUV</option>
                    <option value="Moto">Moto</option>
                </select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="color">Color</Label>
            <Input name="color" placeholder="Rojo metalizado" />
          </div>

          {/* 🔥 4. Botón con estado de carga */}
          <Button 
            type="submit" 
            className="bg-indigo-600 hover:bg-indigo-700 w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                </>
            ) : (
                "Guardar Vehículo"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}