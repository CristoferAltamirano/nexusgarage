"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Car, User, Search } from "lucide-react";
import { createOrder } from "@/actions/create-order"; // Asegúrate que la ruta sea correcta
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  tenantId: string;
  slug: string;
  vehicles: any[]; // Recibimos la lista de vehículos desde la página
}

export function CreateOrderDialog({ tenantId, slug, vehicles = [] }: Props) {
  const [open, setOpen] = useState(false);

  // ESTADOS DEL FORMULARIO (Para poder auto-rellenar)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  // Función mágica: Cuando seleccionas un vehículo de la lista
  const handleSelectVehicle = (vehicleId: string) => {
    const selected = vehicles.find((v) => v.id === vehicleId);
    
    if (selected) {
      // 1. Rellenar Datos del Cliente
      setFirstName(selected.customer.firstName);
      setLastName(selected.customer.lastName);
      setTaxId(selected.customer.taxId || "");
      setEmail(selected.customer.email || "");
      setPhone(selected.customer.phone || "");

      // 2. Rellenar Datos del Vehículo
      setPlate(selected.plateOrSerial);
      setBrand(selected.brand);
      setModel(selected.model);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Nueva Orden
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Ingresar Orden de Trabajo</DialogTitle>
        </DialogHeader>

        {/* --- BUSCADOR RÁPIDO --- */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
          <Label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
            ⚡ Carga Rápida (Vehículos Recientes)
          </Label>
          <Select onValueChange={handleSelectVehicle}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Buscar por Patente o Cliente..." />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <span className="font-bold">{v.plateOrSerial}</span> - {v.brand} ({v.customer.firstName} {v.customer.lastName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form action={async (formData) => {
            await createOrder(formData);
            setOpen(false);
            // Limpiar formulario opcionalmente aquí
        }} className="space-y-6">
            
            {/* Ocultamos IDs necesarios */}
            <input type="hidden" name="tenantId" value={tenantId} />

            {/* SECCIÓN CLIENTE */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 border-b pb-2">
                    <User className="h-4 w-4" />
                    <h3 className="font-semibold text-sm">Datos del Cliente</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Ej: Juan" />
                    </div>
                    <div className="space-y-2">
                        <Label>Apellido</Label>
                        <Input name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Ej: Pérez" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>RUT / DNI</Label>
                        <Input name="taxId" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="12.345.678-9" />
                    </div>
                    <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9..." />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label>Email (Opcional)</Label>
                    <Input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" />
                </div>
            </div>

            {/* SECCIÓN VEHÍCULO */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 border-b pb-2">
                    <Car className="h-4 w-4" />
                    <h3 className="font-semibold text-sm">Datos del Vehículo</h3>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Patente</Label>
                        <Input name="plate" value={plate} onChange={(e) => setPlate(e.target.value)} required placeholder="ABCD-12" className="uppercase" />
                    </div>
                    <div className="space-y-2">
                        <Label>Marca</Label>
                        <Input name="brand" value={brand} onChange={(e) => setBrand(e.target.value)} required placeholder="Toyota" />
                    </div>
                    <div className="space-y-2">
                        <Label>Modelo</Label>
                        <Input name="model" value={model} onChange={(e) => setModel(e.target.value)} required placeholder="Yaris" />
                    </div>
                </div>
            </div>

            {/* SECCIÓN DETALLES INGRESO (Siempre vacíos al inicio) */}
            <div className="space-y-4">
                 <div className="flex items-center gap-2 text-indigo-600 border-b pb-2">
                    <Search className="h-4 w-4" />
                    <h3 className="font-semibold text-sm">Detalles de Ingreso</h3>
                </div>

                <div className="space-y-2">
                    <Label>Motivo / Problema</Label>
                    <Textarea name="description" required placeholder="El cliente reporta ruido en frenos..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Kilometraje</Label>
                        <Input name="kilometer" type="number" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                        <Label>Combustible (%)</Label>
                        <Input name="fuelLevel" type="number" min="0" max="100" placeholder="50" />
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12">
                    Crear Orden
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}