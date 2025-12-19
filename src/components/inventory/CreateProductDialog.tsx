"use client"

import { useState } from "react";
import { createProduct } from "@/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Package, Wrench } from "lucide-react";
import { toast } from "sonner";

interface Props {
  tenantId: string;
  slug: string;
}

export function CreateProductDialog({ tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Repuesto");

  async function handleSubmit(formData: FormData) {
    try {
        formData.append("category", category); // Adjuntamos la categoría del select
        await createProduct(formData);
        toast.success("Producto creado");
        setOpen(false);
    } catch (error) {
        toast.error("Error al crear");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Ítem
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar al Inventario</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 mt-2">
            <input type="hidden" name="tenantId" value={tenantId} />
            <input type="hidden" name="slug" value={slug} />

            <div className="space-y-2">
                <Label>Nombre del Ítem</Label>
                <Input name="name" placeholder="Ej: Filtro de Aceite" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select onValueChange={setCategory} defaultValue="Repuesto">
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Repuesto">📦 Repuesto</SelectItem>
                            <SelectItem value="Mano de Obra">🔧 Mano de Obra</SelectItem>
                            <SelectItem value="Insumo">🛢️ Insumo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Código / SKU (Opcional)</Label>
                    <Input name="code" placeholder="FIL-001" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Precio Neto</Label>
                    <Input name="price" type="number" placeholder="10000" required />
                </div>
                {/* Solo mostramos Stock si es un repuesto o insumo */}
                {category !== "Mano de Obra" && (
                    <div className="space-y-2">
                        <Label>Stock Inicial</Label>
                        <Input name="stock" type="number" defaultValue="0" />
                    </div>
                )}
            </div>

            <Button type="submit" className="w-full bg-indigo-600 mt-4">
                Guardar
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}