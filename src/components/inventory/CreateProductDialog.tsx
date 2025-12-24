"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 1. Importamos useRouter
// ✅ CORRECCIÓN: Importamos desde el archivo maestro de inventario
import { createProduct } from "@/actions/inventory"; 
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

interface Props {
  tenantId: string;
  slug: string;
}

export function CreateProductDialog({ tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // 2. Inicializamos el router

  // Estados para controlar los inputs (opcional, pero útil para limpiar)
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [netPrice, setNetPrice] = useState(""); // Cambiado a netPrice para claridad
  const [stock, setStock] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // 🔒 CLAVE: Agregamos manualmente los metadatos de contexto
    formData.append("tenantId", tenantId);
    formData.append("slug", slug);

    try {
      // Llamamos a la Server Action consolidada
      const res = await createProduct(formData);

      if (res.success) {
        toast.success("Ítem agregado al inventario");
        setOpen(false);
        
        // Limpiar campos
        setName(""); 
        setSku(""); 
        setNetPrice(""); 
        setStock("");
        
        // 3. Refrescamos la vista para mostrar el nuevo producto
        router.refresh();
      } else {
        toast.error(res.error || "Error al guardar el ítem");
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
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Ítem
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Package className="h-5 w-5 text-indigo-600" />
            Agregar al Inventario
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            
            {/* NOMBRE */}
            <div className="space-y-2">
                <Label className="font-semibold text-slate-700">Nombre del Ítem</Label>
                <div className="relative">
                    <Input 
                        name="name" 
                        required 
                        placeholder="Ej: Filtro de Aceite" 
                        className="pl-3 h-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
            </div>

            {/* CATEGORÍA Y CÓDIGO */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-slate-700">Categoría</Label>
                    <Select name="category" defaultValue="Repuesto">
                        <SelectTrigger className="h-10">
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
                    <Label className="font-semibold text-slate-700">Código / SKU <span className="text-slate-400 font-normal text-xs">(Opcional)</span></Label>
                    <Input 
                        name="code" 
                        placeholder="FIL-001" 
                        className="h-10 font-mono text-sm"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                    />
                </div>
            </div>

            {/* PRECIO Y STOCK */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-slate-700">Precio Neto ($)</Label>
                    <Input 
                        name="netPrice" // ✅ CORREGIDO: Coincide con la base de datos
                        type="number" 
                        required 
                        placeholder="0" 
                        min="0"
                        className="h-10"
                        value={netPrice}
                        onChange={(e) => setNetPrice(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-slate-700">Stock Inicial</Label>
                    <Input 
                        name="stock" 
                        type="number" 
                        placeholder="0" 
                        min="0"
                        className="h-10"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11" 
                    disabled={isLoading}
                >
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