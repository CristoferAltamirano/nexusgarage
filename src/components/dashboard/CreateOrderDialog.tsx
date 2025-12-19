"use client"

import { useState } from "react";
import { createOrder } from "@/actions/create-order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle, Car, User, FileText } from "lucide-react";
import { toast } from "sonner"; 

interface Props {
  tenantId: string;
  slug: string;
  vehicles: any[]; // Mantenemos any[] para evitar conflictos de tipos si la DB cambia
  trigger?: React.ReactNode; // <--- ESTO ES VITAL: Permite usar botones personalizados
}

export function CreateOrderDialog({ tenantId, slug, vehicles, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    try {
        await createOrder(formData);
        toast.success("Orden creada correctamente");
        setOpen(false);
    } catch (error) {
        toast.error("Error al crear la orden. Revisa los datos.");
    } finally {
        setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Si le pasamos un botón personalizado (trigger), lo usa. Si no, usa el botón azul por defecto. */}
        {trigger ? (
            trigger
        ) : (
            <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Orden
            </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ingresar Vehículo</DialogTitle>
          <DialogDescription>
            Crea una nueva orden. Si el cliente o vehículo no existen, se registrarán automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-6 mt-2">
            <input type="hidden" name="tenantId" value={tenantId} />
            <input type="hidden" name="slug" value={slug} />

            {/* SECCIÓN 1: CLIENTE */}
            <div className="space-y-4 border-b border-slate-100 pb-4">
                <h3 className="flex items-center text-sm font-semibold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded">
                    <User className="mr-2 h-4 w-4" /> Datos del Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input id="firstName" name="firstName" placeholder="Ej: Juan" required className="bg-slate-50/50" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input id="lastName" name="lastName" placeholder="Ej: Pérez" required className="bg-slate-50/50" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="taxId">RUT / DNI</Label>
                        <Input id="taxId" name="taxId" placeholder="12.345.678-9" required className="bg-slate-50/50" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" name="phone" placeholder="+56 9..." required className="bg-slate-50/50" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email (Opcional)</Label>
                    <Input id="email" name="email" type="email" placeholder="cliente@email.com" className="bg-slate-50/50" />
                </div>
            </div>

            {/* SECCIÓN 2: VEHÍCULO */}
            <div className="space-y-4 border-b border-slate-100 pb-4">
                <h3 className="flex items-center text-sm font-semibold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded">
                    <Car className="mr-2 h-4 w-4" /> Datos del Vehículo
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="plate">Patente</Label>
                        <Input id="plate" name="plate" placeholder="ABCD-12" required className="uppercase font-mono bg-slate-50/50" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Input id="brand" name="brand" placeholder="Toyota" required className="bg-slate-50/50" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="model">Modelo</Label>
                        <Input id="model" name="model" placeholder="Yaris" required className="bg-slate-50/50" />
                    </div>
                </div>
            </div>

            {/* SECCIÓN 3: DETALLES */}
            <div className="space-y-4">
                <h3 className="flex items-center text-sm font-semibold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded">
                    <FileText className="mr-2 h-4 w-4" /> Detalles de Ingreso
                </h3>
                <div className="space-y-2">
                    <Label htmlFor="description">Motivo / Problema</Label>
                    <Textarea 
                        id="description" 
                        name="description" 
                        placeholder="El cliente reporta ruido en frenos..." 
                        required 
                        className="bg-slate-50/50 min-h-[80px]"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="kilometer">Kilometraje</Label>
                        <Input id="kilometer" name="kilometer" type="number" placeholder="0" className="bg-slate-50/50" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fuelLevel">Combustible (%)</Label>
                        <Input id="fuelLevel" name="fuelLevel" type="number" min="0" max="100" placeholder="50" className="bg-slate-50/50" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 shadow-md font-medium text-base">
                    {isPending ? "Creando..." : "Crear Orden"}
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}