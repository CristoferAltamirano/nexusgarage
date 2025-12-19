'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createItem } from "@/actions/create-item";
import { Plus } from "lucide-react";

interface Props {
  workOrderId: string;
  slug: string;
}

export function AddItemDialog({ workOrderId, slug }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
          <Plus size={16} className="mr-1"/> Agregar Ítem
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Servicio o Repuesto</DialogTitle>
        </DialogHeader>

        <form 
          action={async (formData) => {
            await createItem(formData);
            setOpen(false); // Cerrar al terminar
          }} 
          className="grid gap-4 py-4"
        >
          <input type="hidden" name="workOrderId" value={workOrderId} />
          <input type="hidden" name="slug" value={slug} />

          {/* Descripción */}
          <div className="grid gap-2">
            <Label>Descripción</Label>
            <Input name="description" placeholder="Ej: Cambio de Aceite 10W40" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Precio */}
            <div className="grid gap-2">
                <Label>Precio Unitario ($)</Label>
                <Input name="price" type="number" placeholder="0" min="0" required />
            </div>

            {/* Cantidad */}
            <div className="grid gap-2">
                <Label>Cantidad</Label>
                <Input name="quantity" type="number" defaultValue="1" min="1" required />
            </div>
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
            Guardar Cobro
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}