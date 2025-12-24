'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// ✅ CORRECCIÓN: Usamos saveVehicle que es el nombre real en tu archivo de acciones
import { saveVehicle } from "@/actions/vehicles"; 
import { Car, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  customerId: string;
  tenantId: string;
  slug: string;
}

export function AddVehicleDialog({ customerId, tenantId, slug }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      // ✅ CORRECCIÓN: Llamamos a saveVehicle
      const result = await saveVehicle(formData);
      
      if (result.success) {
        toast.success("Vehículo agregado correctamente");
        setOpen(false);
        router.refresh(); 
      } else {
        toast.error(result.error || "Error al crear el vehículo");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-2 border-indigo-200 hover:bg-indigo-50 text-indigo-700">
          <Car size={14} /> + Auto
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-indigo-600" />
            Agregar Vehículo
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="customerId" value={customerId} />
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="slug" value={slug} />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold text-slate-500">TIPO</Label>
            <select 
              name="type" 
              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
                <option value="CAR">Auto / Camioneta</option>
                <option value="MOTORCYCLE">Moto</option>
                <option value="OTHER">Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold text-slate-500">MARCA</Label>
            <Input 
              name="brand" 
              placeholder="Ej: Toyota" 
              className="col-span-3" 
              required 
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold text-slate-500">MODELO</Label>
            <Input 
              name="model" 
              placeholder="Ej: Yaris" 
              className="col-span-3" 
              required 
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold text-slate-500 truncate">PATENTE</Label>
            {/* ✅ CORRECCIÓN: name="plateOrSerial" para coincidir con la Action */}
            <Input 
              name="plateOrSerial" 
              placeholder="Ej: ABCD-12" 
              className="col-span-3 uppercase" 
              required 
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 font-bold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  GUARDANDO...
                </>
              ) : (
                "GUARDAR VEHÍCULO"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}