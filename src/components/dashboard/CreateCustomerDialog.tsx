"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// ✅ Importación vinculada al archivo maestro de acciones
import { saveCustomer } from "@/actions/customers"; 
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, User, Loader2, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Props {
  tenantId: string;
  slug: string;
}

export function CreateCustomerDialog({ tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Hook para refrescar la página

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // ✅ Metadatos críticos para que el servidor identifique el taller y la ruta a refrescar
    formData.append("tenantId", tenantId);
    formData.append("slug", slug);

    try {
      const res = await saveCustomer(formData);

      if (res.success) {
        toast.success("Cliente registrado con éxito");
        setOpen(false);
        (e.target as HTMLFormElement).reset(); // Limpia el formulario tras el éxito
        router.refresh(); // Refresca los datos en pantalla
      } else {
        toast.error(res.error || "Error al registrar cliente");
      }
    } catch (error) {
      console.error("Error al registrar cliente:", error);
      toast.error("Ocurrió un error inesperado de red");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-indigo-600" />
            Registro de Cliente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          {/* IDENTIFICACIÓN DE EMPRESA */}
          <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <Checkbox id="isCompany" name="isCompany" />
            <label htmlFor="isCompany" className="text-sm font-medium cursor-pointer select-none">
              ¿Es una Empresa / Persona Jurídica?
            </label>
          </div>

          {/* NOMBRE Y APELLIDO */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Nombre / Razón Social</Label>
              <Input name="firstName" required placeholder="Ej: Juan" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Apellido</Label>
              <Input name="lastName" required placeholder="Ej: Pérez" />
            </div>
          </div>

          {/* IDENTIFICACIÓN TRIBUTARIA Y TELÉFONO */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">RUT / Tax ID</Label>
              <Input name="taxId" placeholder="12.345.678-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-1">
                <Phone className="h-3 w-3" /> Teléfono
              </Label>
              <Input name="phone" required placeholder="+56 9..." />
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-1">
              <Mail className="h-3 w-3" /> Email
            </Label>
            <Input name="email" type="email" placeholder="cliente@correo.com" />
          </div>

          {/* DIRECCIÓN */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-tighter flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Dirección
            </Label>
            <Input name="address" placeholder="Av. Principal #123, Ciudad" />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 shadow-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Registrar Cliente"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}