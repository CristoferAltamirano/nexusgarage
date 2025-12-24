"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Car, User, Search, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Importación corregida al archivo consolidado
import { saveOrder } from "@/actions/orders";

interface Props {
  tenantId: string;
  slug: string;
  vehicles: any[];
}

export function CreateOrderDialog({ tenantId, slug, vehicles = [] }: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estado unificado para el formulario
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    taxId: "",
    email: "",
    phone: "",
    plate: "",
    brand: "",
    model: "",
  });

  // Manejador de cambios genérico
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Carga rápida al seleccionar un vehículo existente
  const handleSelectVehicle = (vehicleId: string) => {
    const selected = vehicles.find((v) => v.id === vehicleId);

    if (selected) {
      setFormData({
        firstName: selected.customer.firstName,
        lastName: selected.customer.lastName,
        taxId: selected.customer.taxId || "",
        email: selected.customer.email || "",
        phone: selected.customer.phone || "",
        plate: selected.plateOrSerial,
        brand: selected.brand,
        model: selected.model,
      });
      toast.info("Datos cargados correctamente");
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const data = new FormData(e.currentTarget);
    // Añadimos datos de contexto
    data.append("tenantId", tenantId);
    data.append("slug", slug);

    try {
      const res = await saveOrder(data);

      if (res.success) {
        toast.success("Orden de trabajo creada correctamente");
        setOpen(false);
        // Resetear formulario
        setFormData({
          firstName: "", lastName: "", taxId: "", email: "",
          phone: "", plate: "", brand: "", model: ""
        });
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(res.error || "Error al crear la orden");
      }
    } catch (error) {
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all">
          <Plus className="mr-2 h-4 w-4" /> Nueva Orden
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[650px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Ingresar Orden de Trabajo
          </DialogTitle>
        </DialogHeader>

        {/* SECCIÓN DE BÚSQUEDA RÁPIDA */}
        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-2">
          <Label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">
            ⚡ Autocompletar desde historial
          </Label>
          <Select onValueChange={handleSelectVehicle}>
            <SelectTrigger className="bg-white border-indigo-200 focus:ring-indigo-500">
              <SelectValue placeholder="Buscar por patente o nombre de cliente..." />
            </SelectTrigger>
            <SelectContent>
              {vehicles.length > 0 ? (
                vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    <span className="font-mono font-bold">{v.plateOrSerial}</span>
                    <span className="mx-2 text-slate-300">|</span>
                    <span className="text-slate-600">{v.brand} {v.model}</span>
                    <span className="ml-2 text-[10px] text-slate-400">({v.customer.firstName})</span>
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-400">No hay vehículos registrados</div>
              )}
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 pt-2">
          {/* CLIENTE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-50 pb-2">
              <User className="h-4 w-4" />
              <h3 className="font-bold text-sm tracking-tight">Información del Cliente</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Nombre</Label>
                <Input name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Juan" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Apellido</Label>
                <Input name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Pérez" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">RUT / Identificación</Label>
                <Input name="taxId" value={formData.taxId} onChange={handleChange} placeholder="12.345.678-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Teléfono</Label>
                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+56 9..." />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs">Correo Electrónico</Label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="cliente@ejemplo.com" />
            </div>
          </div>

          {/* VEHÍCULO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-50 pb-2">
              <Car className="h-4 w-4" />
              <h3 className="font-bold text-sm tracking-tight">Información del Vehículo</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Patente</Label>
                <Input name="plate" value={formData.plate} onChange={handleChange} required placeholder="AB1234" className="uppercase font-mono bg-slate-50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Marca</Label>
                <Input name="brand" value={formData.brand} onChange={handleChange} required placeholder="Toyota" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Modelo</Label>
                <Input name="model" value={formData.model} onChange={handleChange} required placeholder="Hilux" />
              </div>
            </div>
          </div>

          {/* DETALLES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 border-b border-indigo-50 pb-2">
              <Search className="h-4 w-4" />
              <h3 className="font-bold text-sm tracking-tight">Detalles Técnicos e Ingreso</h3>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Diagnóstico Inicial / Motivo de Visita</Label>
              <Textarea name="description" required placeholder="Describa el problema o servicio solicitado..." className="min-h-[100px] resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Kilometraje actual</Label>
                <Input name="kilometer" type="number" defaultValue={0} min={0} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Nivel de Combustible (%)</Label>
                <Input name="fuelLevel" type="number" min={0} max={100} defaultValue={0} />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 shadow-lg shadow-indigo-100" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando Orden...
                </>
              ) : (
                "Finalizar e Ingresar Orden"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}