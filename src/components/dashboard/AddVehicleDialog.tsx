'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVehicle } from "@/actions/create-vehicle";
import { Car } from "lucide-react";

interface Props {
  customerId: string;
  tenantId: string;
  slug: string;
}

export function AddVehicleDialog({ customerId, tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-2 border-indigo-200 hover:bg-indigo-50 text-indigo-700">
          <Car size={14} /> + Auto
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Vehículo</DialogTitle>
        </DialogHeader>

        <form 
          action={async (formData) => {
            await createVehicle(formData);
            setOpen(false);
          }} 
          className="grid gap-4 py-4"
        >
          <input type="hidden" name="customerId" value={customerId} />
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="slug" value={slug} />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tipo</Label>
            <select name="type" className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="Auto">Auto / Camioneta</option>
                <option value="Moto">Moto</option>
                <option value="Celular">Celular / Tablet</option>
            </select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Marca</Label>
            <Input name="brand" placeholder="Ej: Toyota" className="col-span-3" required />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Modelo</Label>
            <Input name="model" placeholder="Ej: Yaris" className="col-span-3" required />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Patente/Serial</Label>
            <Input name="plate" placeholder="Ej: ABCD-12" className="col-span-3" required />
          </div>

          <Button type="submit" className="ml-auto">Guardar Vehículo</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}