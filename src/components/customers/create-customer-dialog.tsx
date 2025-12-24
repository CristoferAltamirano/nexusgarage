"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCustomer } from "@/actions/customers"; // Asegúrate de que esta ruta sea correcta
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Loader2, Building2, User } from "lucide-react";
import { toast } from "sonner"; 

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
    
    // Forzamos el valor del checkbox si estamos usando estado controlado
    if (isCompany) {
        formData.set("isCompany", "on");
    }

    try {
        const res = await saveCustomer(formData);

        if (res.success) {
            toast.success("Cliente guardado exitosamente");
            
            // 1. Refrescamos la data de la página de atrás (CRÍTICO)
            router.refresh(); 

            // 2. Cerramos el modal y limpiamos
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
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium">
          <UserPlus className="mr-2 h-4 w-4" /> Nuevo Cliente
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             {isCompany ? <Building2 className="h-5 w-5 text-indigo-600"/> : <User className="h-5 w-5 text-indigo-600"/>}
             Registrar Nuevo Cliente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5 mt-2">
            
            {/* SWITCH TIPO DE CLIENTE */}
            <div className="flex items-center space-x-2 border p-3 rounded-lg bg-slate-50 border-slate-200">
                <Checkbox 
                    id="isCompany" 
                    name="isCompany" 
                    checked={isCompany}
                    onCheckedChange={(checked) => setIsCompany(!!checked)}
                />
                <div className="grid gap-0.5 leading-none">
                    <Label htmlFor="isCompany" className="font-semibold cursor-pointer text-slate-700">
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
                    <Label>{isCompany ? "Razón Social" : "Nombre"}</Label>
                    <Input 
                        name="firstName" 
                        placeholder={isCompany ? "Ej: Transportes del Sur SpA" : "Ej: Juan"} 
                        required 
                    />
                </div>
                
                {!isCompany && (
                    <div className="space-y-2">
                        <Label>Apellido</Label>
                        <Input name="lastName" placeholder="Ej: Pérez" />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>RUT / Tax ID</Label>
                    <Input name="taxId" placeholder="12.345.678-9" />
                </div>
                <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input name="phone" placeholder="+56 9 1234 5678" required />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Email (Opcional)</Label>
                <Input name="email" type="email" placeholder="cliente@email.com" />
            </div>

            <div className="space-y-2">
                <Label>Dirección (Opcional)</Label>
                <Input name="address" placeholder="Av. Siempre Viva 123" />
            </div>

            <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-4 font-bold h-11"
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
        </form>
      </DialogContent>
    </Dialog>
  );
}