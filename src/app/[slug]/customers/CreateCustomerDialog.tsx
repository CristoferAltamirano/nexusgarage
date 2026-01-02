'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue, 
} from "@/components/ui/select";
import { createCustomer } from "@/actions/customers"; 
import { UserPlus, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
// Importamos nuestra configuración de países
import { COUNTRIES, getCountryConfig, CountryCode } from "@/config/localization";

interface Props {
  tenantId: string;
  slug: string;
}

export default function CreateCustomerDialog({ tenantId, slug }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para el país seleccionado (Por defecto Chile 'CL')
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('CL');
  
  // Obtenemos la configuración dinámica según el país
  const localization = getCountryConfig(selectedCountry);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      // Agregamos el país al formData antes de enviarlo
      formData.append('country', selectedCountry);
      
      const result = await createCustomer(formData);
      
      if (result.success) {
        toast.success("Cliente creado correctamente");
        setOpen(false);
        router.refresh(); 
      } else {
        toast.error(result.error || "Error al crear el cliente");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al guardar el cliente");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 font-bold uppercase text-xs">
          <UserPlus size={16} /> Nuevo Cliente
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            Registrar Nuevo Cliente
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="slug" value={slug} />

          {/* 🌎 SELECCIÓN DE PAÍS */}
          <div className="grid gap-2">
            <Label className="font-bold text-slate-500 text-xs uppercase flex items-center gap-1">
                <Globe className="h-3 w-3" /> País
            </Label>
            <Select 
                value={selectedCountry} 
                onValueChange={(val) => setSelectedCountry(val as CountryCode)}
                disabled={isLoading}
            >
                <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="font-bold text-slate-500 text-xs uppercase">Nombre *</Label>
              <Input name="firstName" placeholder="Ej: Pedro" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label className="font-bold text-slate-500 text-xs uppercase">Apellido *</Label>
              <Input name="lastName" placeholder="Ej: Pascal" required disabled={isLoading} />
            </div>
          </div>

          {/* 🆔 DOCUMENTO DE IDENTIDAD DINÁMICO */}
          <div className="grid gap-2">
            <Label className="font-bold text-slate-500 text-xs uppercase">
                {localization.taxIdLabel} * <span className="ml-1 text-slate-400 font-normal normal-case">(Documento)</span>
            </Label>
            <Input 
              name="rut" // Nota: En el backend probablemente lo recibas como 'rut', si no has cambiado el esquema
              placeholder={`Ej: ${localization.taxIdPlaceholder}`} 
              required 
              disabled={isLoading} 
            />
          </div>

          <div className="grid gap-2">
            <Label className="font-bold text-slate-500 text-xs uppercase">Teléfono / WhatsApp *</Label>
            <div className="flex gap-2">
                {/* Prefijo telefónico automático */}
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

          <div className="grid gap-2">
            <Label className="font-bold text-slate-500 text-xs uppercase">Email (Opcional)</Label>
            <Input name="email" type="email" placeholder="cliente@ejemplo.com" disabled={isLoading} />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="bg-indigo-600 hover:bg-indigo-700 w-full mt-2 font-bold uppercase"
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