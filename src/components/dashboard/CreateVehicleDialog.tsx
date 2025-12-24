"use client";

import { useState } from "react";
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
import { CarFront, Loader2, Plus, User } from "lucide-react";
import { toast } from "sonner";
import { saveVehicle } from "@/actions/vehicles";

// Definimos la estructura básica del cliente para el select
interface CustomerOption {
  id: string;
  firstName: string;
  lastName: string;
  taxId: string | null;
}

interface Props {
  tenantId: string;
  slug: string;
  customers?: CustomerOption[]; // Lista de clientes para el dropdown
  customerId?: string;          // ID opcional si venimos desde el perfil
}

export function CreateVehicleDialog({ tenantId, slug, customers = [], customerId }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Si NO tenemos un ID fijo, mostramos el selector.
  // Si YA tenemos un ID (porque estamos en el perfil del cliente), lo ocultamos.
  const showCustomerSelect = !customerId;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("tenantId", tenantId);
    formData.append("slug", slug);

    // Si el cliente venía preseleccionado (oculto), lo agregamos manualmente
    if (customerId) {
      formData.append("customerId", customerId);
    }

    try {
      const res = await saveVehicle(formData);

      if (res.success) {
        toast.success("Vehículo registrado correctamente");
        setOpen(false);
        (e.target as HTMLFormElement).reset(); 
      } else {
        toast.error(res.error || "Error al guardar el vehículo");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-medium">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Vehículo
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] p-6">
        <DialogHeader className="pb-4 border-b mb-4">
          <DialogTitle className="text-xl font-bold text-slate-900">
            Registrar Vehículo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          
          {/* 1. SELECCIÓN DE DUEÑO (Igual a la foto) */}
          {showCustomerSelect ? (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                Dueño del Vehículo <span className="text-red-500">*</span>
              </Label>
              <Select name="customerId" required>
                <SelectTrigger className="h-11 bg-white border-slate-200">
                  <SelectValue placeholder="Selecciona un cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.length > 0 ? (
                    customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} {c.taxId ? `• ${c.taxId}` : ''}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-slate-500 text-center">
                      No hay clientes. Crea uno primero.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            // Si ya estamos en el perfil, mostramos un aviso visual simple
            <div className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Asignando vehículo al cliente actual
            </div>
          )}

          {/* 2. MARCA Y MODELO (En fila) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Marca <span className="text-red-500">*</span>
              </Label>
              <Input 
                name="brand" 
                placeholder="Ej: Toyota" 
                className="h-11" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Modelo <span className="text-red-500">*</span>
              </Label>
              <Input 
                name="model" 
                placeholder="Ej: Yaris" 
                className="h-11" 
                required 
              />
            </div>
          </div>

          {/* 3. PATENTE Y TIPO (En fila) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Patente <span className="text-red-500">*</span>
              </Label>
              <Input 
                name="plateOrSerial" 
                placeholder="ABCD-12" 
                className="h-11 uppercase font-mono tracking-wide" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Tipo
              </Label>
              <Select name="type" defaultValue="CAR">
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAR">Automóvil</SelectItem>
                  <SelectItem value="MOTORCYCLE">Moto</SelectItem>
                  <SelectItem value="TRUCK">Camioneta</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 4. COLOR (Ancho completo) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Color
            </Label>
            <Input 
              name="color" 
              placeholder="Ej: Rojo metalizado" 
              className="h-11" 
            />
          </div>

          {/* BOTÓN DE GUARDADO (Estilo Nexus Garage) */}
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 text-base shadow-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar Vehículo"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}