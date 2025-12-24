"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/actions/inventory";
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
import { Package, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  category: string;
  netPrice: number;
  stock: number;
  code?: string | null;
}

interface Props {
  product: Product;
  tenantId: string;
  slug: string;
}

export function EditProductDialog({ product, tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const [category, setCategory] = useState(product.category || "Repuesto");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("id", product.id);
    formData.append("tenantId", tenantId);
    formData.append("slug", slug);
    formData.append("category", category);

    try {
      const res = await updateProduct(formData);

      if (res.success) {
        toast.success("Ítem actualizado correctamente");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "No se pudo actualizar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Badge
          variant="outline"
          className="h-8 w-8 p-0 flex items-center justify-center border-slate-200 hover:bg-slate-50 hover:text-indigo-600 cursor-pointer transition-colors"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-400 hover:text-indigo-600" />
        </Badge>
      </DialogTrigger>

      {/* Ajuste para móviles: max-h-screen y overflow para scroll si es necesario */}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Ítem</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 mt-2">
          
          {/* Nombre */}
          <div className="space-y-2">
            <Label>Nombre del Ítem</Label>
            <div className="relative">
              <Package className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                name="name"
                defaultValue={product.name}
                className="pl-9"
                required
                placeholder="Ej: Filtro de Aceite"
              />
            </div>
          </div>

          {/* 🛠️ CORRECCIÓN VISUAL:
             grid-cols-1 (1 columna en móvil) 
             sm:grid-cols-2 (2 columnas en PC/Tablet)
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Repuesto">📦 Repuesto</SelectItem>
                  <SelectItem value="Mano de Obra">🔧 Mano de Obra</SelectItem>
                  <SelectItem value="Insumo">🛢️ Insumo</SelectItem>
                  <SelectItem value="Servicio Externo">🔌 Servicio Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Código / SKU (Opcional)</Label>
              <Input
                name="code"
                defaultValue={product.code || ""}
                placeholder="FIL-001"
              />
            </div>
          </div>

          {/* Precio y Stock: Misma corrección responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Precio Neto</Label>
              <Input
                name="netPrice"
                type="number"
                defaultValue={product.netPrice}
                required
                min="0"
                placeholder="0"
              />
            </div>

            {category !== "Mano de Obra" && (
              <div className="space-y-2">
                <Label>Stock Actual</Label>
                <Input
                  name="stock"
                  type="number"
                  defaultValue={product.stock}
                  min="0"
                  placeholder="0"
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}