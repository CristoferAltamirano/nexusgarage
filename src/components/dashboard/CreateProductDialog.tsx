'use client';

import { useState, useEffect } from "react"; // ✅ Agregamos useEffect
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProduct } from "@/actions/inventory"; 
import { PackagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  tenantId: string;
  slug: string;
}

export function CreateProductDialog({ tenantId, slug }: Props) {
  const router = useRouter();
  
  // 1. ESTADO DE MONTAJE (La solución al error rojo)
  const [isMounted, setIsMounted] = useState(false);
  
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 2. EFECTO DE MONTAJE
  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await createProduct(formData);
      
      if (result.success) {
        toast.success("Ítem agregado al inventario correctamente");
        setOpen(false);
        router.refresh(); 
      } else {
        toast.error(result.error || "Error al crear el producto");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al guardar");
    } finally {
      setIsLoading(false);
    }
  }

  // 3. RENDERIZADO CONDICIONAL
  // Si no está montado, retornamos solo el botón (sin el Dialog complejo) para evitar mismatch
  if (!isMounted) {
    return (
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 font-bold uppercase text-xs">
            <PackagePlus size={16} /> Nuevo Ítem
        </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 font-bold uppercase text-xs">
            <PackagePlus size={16} /> Nuevo Ítem
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <PackagePlus className="h-5 w-5 text-indigo-600" />
               Agregar al Inventario
            </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="grid gap-4 py-4">
          {/* Campos ocultos de contexto */}
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="slug" value={slug} />

          {/* NOMBRE */}
          <div className="grid gap-2">
            <Label className="font-bold text-slate-500 text-xs uppercase">Nombre del Servicio / Repuesto *</Label>
            <Input 
              name="name" 
              placeholder="Ej: Filtro de Aceite" 
              required 
              disabled={isLoading}
            />
          </div>

          {/* CÓDIGO SKU */}
          <div className="grid gap-2">
            <Label className="font-bold text-slate-500 text-xs uppercase">Código / SKU (Opcional)</Label>
            <Input 
              name="code" 
              placeholder="Ej: FIL-001" 
              disabled={isLoading}
              className="uppercase font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="grid gap-2">
                <Label className="font-bold text-slate-500 text-xs uppercase">Precio (Neto)</Label>
                <Input 
                  name="price" 
                  type="number" 
                  placeholder="15000" 
                  required 
                  disabled={isLoading}
                />
            </div>
            <div className="grid gap-2">
                <Label className="font-bold text-slate-500 text-xs uppercase">Stock Actual</Label>
                <Input 
                  name="stock" 
                  type="number" 
                  defaultValue="0" 
                  disabled={isLoading}
                />
            </div>
          </div>

          {/* CATEGORÍA */}
          <div className="grid gap-2">
            <Label className="font-bold text-slate-500 text-xs uppercase">Categoría</Label>
            <select 
              name="category" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
                <option value="Repuesto">Repuesto (Producto)</option>
                <option value="Mano de Obra">Mano de Obra (Servicio)</option>
                <option value="Insumo">Insumo</option>
            </select>
          </div>

          <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 w-full mt-2 font-bold uppercase">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Ítem"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}