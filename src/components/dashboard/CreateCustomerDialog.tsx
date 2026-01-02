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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue, 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Loader2, Building2, User, Globe } from "lucide-react";
import { toast } from "sonner"; 
import { createCustomer } from "@/actions/customers";
// Importamos la configuración de países (Asegúrate de que la ruta sea correcta)
import { COUNTRIES, getCountryConfig, CountryCode } from "@/config/localization";

interface Props {
  tenantId: string;
  slug: string;
}

export function CreateCustomerDialog({ tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  
  // Estado para el país seleccionado (Por defecto Chile 'CL')
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('CL');
  
  // Obtenemos la configuración dinámica
  const localization = getCountryConfig(selectedCountry);
  
  const router = useRouter(); 

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("tenantId", tenantId);
    formData.append("slug", slug);
    // Enviamos el país seleccionado para futuras referencias
    formData.append("country", selectedCountry);
    
    if (isCompany) {
        formData.set("isCompany", "on");
    } else {
        formData.delete("isCompany");
    }

    try {
        const res = await createCustomer(formData);

        if (res.success) {
            toast.success(`Cliente de ${localization.name} guardado exitosamente`);
            router.refresh(); 
            setOpen(false);
            (e.target as HTMLFormElement).reset();
            setIsCompany(false);
            // No reseteamos el país para facilitar la carga masiva del mismo país
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
      
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             {isCompany ? <Building2 className="h-5 w-5 text-indigo-600"/> : <User className="h-5 w-5 text-indigo-600"/>}
             Registrar Nuevo Cliente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-2 space-y-5">
            
            {/* 🌎 SELECTOR DE PAÍS */}
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="flex flex-col gap-2">
                    <Label className="text-xs font-bold uppercase text-indigo-600 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> País de Origen
                    </Label>
                    <Select 
                        value={selectedCountry} 
                        onValueChange={(val) => setSelectedCountry(val as CountryCode)}
                        disabled={isLoading}
                    >
                        <SelectTrigger className="bg-white border-indigo-200">
                            <SelectValue placeholder="Selecciona un país" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(COUNTRIES).map(([code, config]) => (
                                <SelectItem key={code} value={code}>
                                    {config.name} ({config.taxIdLabel})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

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
                {/* 🆔 DOCUMENTO DINÁMICO */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">
                        {localization.taxIdLabel} <span className="text-indigo-600 ml-1">({selectedCountry})</span>
                    </Label>
                    <Input 
                      name="taxId" // Usamos un nombre genérico visualmente, pero internamente mapea a tu BD
                      placeholder={localization.taxIdPlaceholder} 
                      disabled={isLoading}
                    />
                </div>
                
                {/* 📞 TELÉFONO CON PREFIJO */}
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Teléfono</Label>
                    <div className="flex gap-2">
                        <div className="flex items-center justify-center bg-slate-100 border rounded px-3 text-sm text-slate-500 font-bold min-w-[3.5rem]">
                            {localization.phoneCode}
                        </div>
                        <Input 
                          name="phone" 
                          placeholder="9 1234 5678" 
                          required 
                          disabled={isLoading} 
                          className="flex-1"
                        />
                    </div>
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

            <div className="flex justify-end gap-3 pt-4 border-t">
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