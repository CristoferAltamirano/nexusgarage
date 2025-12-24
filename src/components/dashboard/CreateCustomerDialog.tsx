"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Loader2, Building2, User } from "lucide-react";
import { toast } from "sonner"; 
// ✅ CORRECCIÓN: Importamos createCustomer que es el export real en tu actions/customers.ts
import { createCustomer } from "@/actions/customers";

interface Props {
  tenantId: string;
  slug: string;
}

export function CreateCustomerDialog({ tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Estado para controlar si es empresa y cambiar los labels del formulario
  const [isCompany, setIsCompany] = useState(false);
  
  const router = useRouter(); 

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    // Aseguramos que los datos de contexto viajen
    formData.append("tenantId", tenantId);
    formData.append("slug", slug);
    
    // Sincronizar el valor del checkbox manualmente
    if (isCompany) {
        formData.set("isCompany", "on");
    } else {
        formData.delete("isCompany");
    }

    try {
        // ✅ CORRECCIÓN: Usamos createCustomer
        const res = await createCustomer(formData);

        if (res.success) {
            toast.success("Cliente guardado exitosamente");
            
            // Refrescamos la data de la página de atrás
            router.refresh(); 

            // Cerramos el modal y limpiamos
            setOpen(false);
            (e.target as HTMLFormElement).reset();
            setIsCompany(false); // Reseteamos el switch de empresa
        } else {
            toast.error(res.error || "Error al guardar el cliente");
        }

    } catch (error) {
        console.error(error);
        toast.error("Ocurrió un error inesperado de conexión");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 font-medium text-white shadow-sm hover:bg-indigo-700">
          <UserPlus className="mr-2 h-4 w-4" /> Nuevo Cliente
        </Button>
      </DialogTrigger>
      
      {/* ✅ CORRECCIÓN TAILWIND: sm:max-w-xl es la clase canónica para 600px aprox. */}
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             {isCompany ? <Building2 className="h-5 w-5 text-indigo-600"/> : <User className="h-5 w-5 text-indigo-600"/>}
             Registrar Nuevo Cliente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-2 space-y-5">
            
            {/* SWITCH TIPO DE CLIENTE */}
            <div className="flex items-center space-x-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <Checkbox 
                    id="isCompany" 
                    name="isCompany" 
                    checked={isCompany}
                    onCheckedChange={(checked) => setIsCompany(!!checked)}
                />
                <div className="grid gap-0.5 leading-none">
                    <Label htmlFor="isCompany" className="cursor-pointer font-semibold text-slate-700">
                        ¿Es Empresa / Persona Jurídica?
                    </Label>
                    <p className="text-xs text-slate-500">
                        Activa esto si necesitas registrar Razón Social en lugar de Nombre/Apellido.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Si es empresa, ocupa todo el ancho. Si es persona, comparte con Apellido */}
                <div className={isCompany ? "col-span-2 space-y-2" : "space-y-2"}>
                    <Label className="text-xs font-bold uppercase text-slate-500">
                      {isCompany ? "Razón Social" : "Nombre"}
                    </Label>
                    <Input 
                        name="firstName" 
                        placeholder={isCompany ? "Ej: Transportes del Sur SpA" : "Ej: Juan"} 
                        required 
                        disabled={isLoading}
                    />
                </div>
                
                {!isCompany && (
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Apellido</Label>
                        <Input 
                          name="lastName" 
                          placeholder="Ej: Pérez" 
                          disabled={isLoading}
                          required
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">RUT / Tax ID</Label>
                    <Input 
                      name="taxId" 
                      placeholder="12.345.678-9" 
                      disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Teléfono</Label>
                    <Input 
                      name="phone" 
                      placeholder="+56 9 1234 5678" 
                      required 
                      disabled={isLoading}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Email (Opcional)</Label>
                <Input 
                  name="email" 
                  type="email" 
                  placeholder="cliente@email.com" 
                  disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-500">Dirección (Opcional)</Label>
                <Input 
                  name="address" 
                  placeholder="Av. Siempre Viva 123" 
                  disabled={isLoading}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                  type="submit" 
                  className="h-11 bg-indigo-600 font-bold text-white shadow-sm hover:bg-indigo-700 min-w-[150px]"
                  disabled={isLoading}
              >
                  {isLoading ? (
                      <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                      </>
                  ) : (
                      "Guardar Cliente"
                  )}
              </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}