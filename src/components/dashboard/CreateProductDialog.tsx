'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProduct } from "@/actions/create-product";
import { PackagePlus } from "lucide-react";

export function CreateProductDialog({ tenantId, slug }: { tenantId: string, slug: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <PackagePlus size={16} /> Nuevo Ítem
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
            <DialogTitle>Agregar al Inventario</DialogTitle>
        </DialogHeader>

        <form action={async (fd) => { await createProduct(fd); setOpen(false); }} className="grid gap-4 py-4">
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="slug" value={slug} />

          {/* CAMPO 1: NOMBRE */}
          <div className="grid gap-2">
            <Label>Nombre del Servicio / Repuesto *</Label>
            <Input name="name" placeholder="Ej: Filtro de Aceite" required />
          </div>

          {/* CAMPO 2: CÓDIGO SKU (NUEVO) */}
          <div className="grid gap-2">
            <Label>Código / SKU (Opcional)</Label>
            <Input name="code" placeholder="Ej: FIL-001 (Si lo dejas vacío se genera solo)" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
                <Label>Precio (Neto)</Label>
                <Input name="price" type="number" placeholder="15000" required />
            </div>
            <div className="grid gap-2">
                <Label>Stock Actual</Label>
                <Input name="stock" type="number" defaultValue="0" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Categoría</Label>
            <select name="category" className="flex h-10 w-full rounded-md border border-input px-3 text-sm">
                <option value="Repuesto">Repuesto (Producto)</option>
                <option value="Mano de Obra">Mano de Obra (Servicio)</option>
                <option value="Insumo">Insumo</option>
            </select>
          </div>

          <Button type="submit" className="bg-indigo-600 w-full mt-2">Guardar Ítem</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}