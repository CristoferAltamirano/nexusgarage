'use client'; 

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCustomer } from "@/actions/create-customer";
import { UserPlus } from "lucide-react"; // Opcional: Icono para el botón

interface Props {
  tenantId: string;
  slug: string;
}

export function CreateCustomerDialog({ tenantId, slug }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          {/* Si tienes lucide-react instalado, el icono se ve bien aqui */}
          <UserPlus size={16} /> 
          Nuevo Cliente
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Cliente</DialogTitle>
          <DialogDescription>
            Ingresa los datos del cliente. El RUT es obligatorio para facturación.
          </DialogDescription>
        </DialogHeader>

        {/* El Formulario conecta con la Server Action */}
        <form 
          action={async (formData) => {
            await createCustomer(formData);
            setOpen(false); // Cierra el modal al terminar
          }} 
          className="grid gap-4 py-4"
        >
          {/* Datos Ocultos necesarios para la base de datos */}
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="slug" value={slug} />

          {/* CAMPO 1: RUT (NUEVO Y OBLIGATORIO) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="taxId" className="text-right font-bold">
              RUT *
            </Label>
            <Input 
              id="taxId" 
              name="taxId" 
              placeholder="Ej: 12.345.678-9" 
              className="col-span-3" 
              required 
            />
          </div>

          {/* CAMPO 2: NOMBRE */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              Nombre *
            </Label>
            <Input 
              id="firstName" 
              name="firstName" 
              placeholder="Juan" 
              className="col-span-3" 
              required 
            />
          </div>
          
          {/* CAMPO 3: APELLIDO */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Apellido
            </Label>
            <Input 
              id="lastName" 
              name="lastName" 
              placeholder="Pérez" 
              className="col-span-3" 
              required 
            />
          </div>

          {/* CAMPO 4: TELÉFONO */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Teléfono *
            </Label>
            <Input 
              id="phone" 
              name="phone" 
              placeholder="+56 9 1234 5678" 
              className="col-span-3" 
              required 
            />
          </div>

          {/* CAMPO 5: EMAIL */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="cliente@email.com" 
              className="col-span-3" 
            />
          </div>

          {/* CAMPO 6: DIRECCIÓN (NUEVO) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Dirección
            </Label>
            <Input 
              id="address" 
              name="address" 
              placeholder="Av. Siempre Viva 742" 
              className="col-span-3" 
            />
          </div>

          {/* CAMPO 7: CHECKBOX EMPRESA (NUEVO) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-start-2 col-span-3 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isCompany" 
                name="isCompany" 
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
              />
              <Label htmlFor="isCompany" className="font-normal cursor-pointer">
                Es Empresa (Solicita Factura)
              </Label>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
              Guardar Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}