"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Package } from "lucide-react";
import { createProduct } from "@/actions/create-product"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  tenantId: string;
  slug: string;
}

export function CreateProductDialog({ tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para controlar los inputs y limpiarlos después
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Evitamos que la página se recargue bruscamente
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // 🔒 CLAVE: Agregamos manualmente el tenantId y slug
    // Esto asegura que la Server Action sepa exactamente dónde guardar
    formData.append("tenantId", tenantId);
    formData.append("slug", slug);

    try {
      const res = await createProduct(formData);

      if (res?.success) {
        toast.success("Ítem agregado al inventario");
        setOpen(false);
        // Limpiar campos
        setName(""); setSku(""); setPrice(""); setStock("");
      } else {
        toast.error(res?.error || "Error al guardar el ítem");
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
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Ítem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar al Inventario</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            
            {/* INPUTS OCULTOS (Respaldo por si acaso) */}
            <input type="hidden" name="tenantId" value={tenantId} />
            
            <div className="space-y-2">
                <Label>Nombre del Ítem</Label>
                <div className="relative">
                    <Package className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                        name="name" 
                        required 
                        placeholder="Ej: Filtro de Aceite" 
                        className="pl-9"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select name="category" defaultValue="Repuesto">
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
                    <Input 
                        name="code" // Asegúrate que coincida con lo que espera tu action (code o sku)
                        placeholder="FIL-001" 
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Precio Neto</Label>
                    <Input 
                        name="price" 
                        type="number" 
                        required 
                        placeholder="0" 
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Stock Inicial</Label>
                    <Input 
                        name="stock" 
                        type="number" 
                        placeholder="0" 
                        min="0"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                        </>
                    ) : "Guardar Ítem"}
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}