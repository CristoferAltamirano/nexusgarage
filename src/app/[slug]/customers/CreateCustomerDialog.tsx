"use client"

import { useState } from "react";
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
import { Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  tenantId: string;
  slug: string;
}

export function CreateCustomerDialog({ tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    try {
        await createCustomer(formData);
        toast.success("Cliente registrado correctamente");
        setOpen(false);
    } catch (error) {
        toast.error("Error al registrar cliente");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <UserPlus className="mr-2 h-4 w-4" /> Nuevo Cliente
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 mt-2">
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
                    <Input name="taxId" placeholder="12.345.678-9" />
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
            
            <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="isCompany" name="isCompany" />
                <Label htmlFor="isCompany" className="font-normal text-slate-600">
                    Es una Empresa (Factura)
                </Label>
            </div>

            <Button type="submit" className="w-full bg-indigo-600 mt-4">
                Guardar Cliente
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}