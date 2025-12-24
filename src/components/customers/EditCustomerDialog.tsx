"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCustomer } from "@/actions/update-customer";
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
import { User, Phone, Mail, MapPin, Building2, FileBadge, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Props {
  customer: any;
  tenantId: string;
  slug: string;
}

export function EditCustomerDialog({ customer, tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("id", customer.id);
    formData.append("tenantId", tenantId);
    formData.append("slug", slug);

    // Manejo manual del checkbox si no se envía marcado
    if (!formData.get("isCompany")) {
        formData.append("isCompany", "off");
    }

    try {
      await updateCustomer(formData);
      toast.success("Cliente actualizado correctamente");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar cliente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* GATILLO: El botón del lápiz */}
      <DialogTrigger asChild>
        <Badge
          variant="outline"
          className="h-8 w-8 p-0 flex items-center justify-center border-slate-200 hover:bg-slate-50 hover:text-indigo-600 cursor-pointer transition-colors"
        >
          <Pencil className="h-3.5 w-3.5 text-slate-400 hover:text-indigo-600" />
        </Badge>
      </DialogTrigger>

      {/* CONTENIDO DEL MODAL */}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 mt-2">
            
            {/* Grid Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    name="firstName" 
                    defaultValue={customer.firstName} 
                    className="pl-9" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input 
                    name="lastName" 
                    defaultValue={customer.lastName} 
                    required 
                />
              </div>
            </div>

            {/* Grid RUT y Teléfono */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>RUT / DNI</Label>
                <div className="relative">
                  <FileBadge className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    name="taxId" 
                    defaultValue={customer.taxId} 
                    className="pl-9" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    name="phone" 
                    defaultValue={customer.phone} 
                    className="pl-9" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email (Opcional)</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    name="email" 
                    type="email" 
                    defaultValue={customer.email} 
                    className="pl-9" 
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label>Dirección (Opcional)</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    name="address" 
                    defaultValue={customer.address} 
                    className="pl-9" 
                />
              </div>
            </div>

            {/* Checkbox Empresa */}
            <div className="flex items-center space-x-2 border p-3 rounded-md bg-slate-50 mt-2">
              <Checkbox id="isCompany" name="isCompany" defaultChecked={customer.isCompany} />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="isCompany" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  Es una Empresa
                </Label>
                <p className="text-[11px] text-slate-500">Marca esto si requiere factura a razón social.</p>
              </div>
            </div>

            {/* Botón de Guardar */}
            <div className="pt-4">
                <Button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10"
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