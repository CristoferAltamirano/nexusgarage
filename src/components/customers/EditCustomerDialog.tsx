"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Pencil, User, Loader2, Mail, Phone, MapPin, Save, Building2 } from "lucide-react";
import { toast } from "sonner";

// ✅ Importación corregida: Usamos createCustomer que es el export real en tu actions/customers.ts
import { createCustomer } from "@/actions/customers";

interface Props {
  customer: any; 
  tenantId: string;
  slug: string;
}

export function EditCustomerDialog({ customer, tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para controlar el switch de empresa
  const [isCompany, setIsCompany] = useState(customer.isCompany || false);
  
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Metadatos críticos para la acción
    formData.append("id", customer.id);
    formData.append("tenantId", tenantId);
    formData.append("slug", slug);

    // Sincronizar el valor del checkbox manualmente ya que los forms nativos
    // a veces no envían el valor si no está marcado.
    if (isCompany) {
        formData.set("isCompany", "on");
    } else {
        formData.delete("isCompany");
    }

    try {
      // ✅ Llamada a la acción corregida
      const res = await createCustomer(formData);

      if (res.success) {
        toast.success("Cliente actualizado correctamente");
        router.refresh(); // Refresca los datos del servidor sin recargar la página
        setOpen(false);
      } else {
        toast.error(res.error || "Error al actualizar el cliente");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
            {isCompany ? <Building2 className="h-5 w-5 text-indigo-600"/> : <User className="h-5 w-5 text-indigo-600"/>}
            Editar Perfil
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          
          {/* TIPO DE CLIENTE */}
          <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <Checkbox 
              id="isCompanyEdit" 
              name="isCompany" 
              checked={isCompany}
              onCheckedChange={(c) => setIsCompany(!!c)}
            />
            <div className="grid gap-0.5 leading-none">
              <label htmlFor="isCompanyEdit" className="text-sm font-bold cursor-pointer select-none text-slate-700">
                ¿Es una Empresa?
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={isCompany ? "col-span-2 space-y-2" : "space-y-2"}>
              <Label className="text-xs font-bold uppercase text-slate-500">
                {isCompany ? "Razón Social" : "Nombre"}
              </Label>
              <Input 
                name="firstName" 
                defaultValue={customer.firstName} 
                required 
                disabled={isLoading}
              />
            </div>
            
            {!isCompany && (
                <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Apellido</Label>
                <Input 
                    name="lastName" 
                    defaultValue={customer.lastName} 
                    required 
                    disabled={isLoading}
                />
                </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">RUT / Tax ID</Label>
              <Input 
                name="taxId" 
                defaultValue={customer.taxId || ""} 
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                <Phone className="h-3 w-3" /> Teléfono
              </Label>
              <Input 
                name="phone" 
                defaultValue={customer.phone} 
                required 
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
              <Mail className="h-3 w-3" /> Email
            </Label>
            <Input 
              name="email" 
              type="email" 
              defaultValue={customer.email || ""} 
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Dirección
            </Label>
            <Input 
              name="address" 
              defaultValue={customer.address || ""} 
              disabled={isLoading}
            />
          </div>

          <div className="pt-4 grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}