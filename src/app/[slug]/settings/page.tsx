import { db } from "@/lib/db";
import { updateSettings } from "@/actions/update-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, MapPin, Phone, Mail, Globe, CheckCircle2, Percent } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SettingsPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const showSuccess = searchParams.success === "true";

  // 1. Buscar los datos actuales del taller
  const tenant = await db.tenant.findUnique({
    where: { slug: params.slug }
  });

  if (!tenant) return <div>Taller no encontrado</div>;

  // 🛠️ CÁLCULOS PARA LA VISTA PREVIA (Simulación)
  // Usamos datos falsos para mostrar cómo se vería
  const taxRate = tenant.taxRate || 0;
  const dummySubtotal = 20000; // Ejemplo: 15.000 + 5.000
  const dummyTaxAmount = (dummySubtotal * taxRate) / 100;
  const dummyTotal = dummySubtotal + dummyTaxAmount;

  // Helper para formatear dinero en pesos (o tu moneda local)
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    }).format(amount);
  };

  // 🛠️ Server Action Wrapper
  async function handleUpdateSettings(formData: FormData) {
    "use server";
    await updateSettings(formData);
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="col-span-2">
            <form action={handleUpdateSettings}>
                <input type="hidden" name="tenantId" value={tenant.id} />
                <input type="hidden" name="slug" value={tenant.slug} />

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Store className="h-5 w-5 text-indigo-600" />
                            Datos del Taller
                        </CardTitle>
                        <CardDescription>
                            Esta información aparecerá en los encabezados de tus órdenes de trabajo PDF.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        
                        {/* Mensaje de éxito */}
                        {showSuccess && (
                            <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center gap-2 text-sm border border-green-200 animate-in fade-in">
                                <CheckCircle2 size={16} />
                                ¡Datos actualizados correctamente!
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Nombre del Taller</Label>
                            <div className="relative">
                                <Store className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="name" defaultValue={tenant.name} className="pl-9 font-medium" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Teléfono / WhatsApp</Label>
                                <div className="relative">
                                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input name="phone" defaultValue={tenant.phone || ""} placeholder="+56 9 ..." className="pl-9" />
                                </div>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label>Email de Contacto</Label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input name="email" defaultValue={tenant.email || ""} placeholder="contacto@taller.cl" className="pl-9" />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Dirección</Label>
                            <div className="relative">
                                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="address" defaultValue={tenant.address || ""} placeholder="Av. Principal 123, Temuco" className="pl-9" />
                            </div>
                        </div>

                        {/* ✅ CAMPO DE IMPUESTO / IVA */}
                        <div className="grid gap-2">
                            <Label>Impuesto / IVA (%)</Label>
                            <div className="relative">
                                <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    name="taxRate" 
                                    type="number" 
                                    step="0.01"
                                    defaultValue={tenant.taxRate || 0} 
                                    placeholder="Ej: 19" 
                                    className="pl-9" 
                                />
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Este porcentaje se agregará al total en tus órdenes. Pon 0 si no usas IVA.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label>Sitio Web (Opcional)</Label>
                            <div className="relative">
                                <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="website" defaultValue={tenant.website || ""} placeholder="www.mitaller.cl" className="pl-9" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>URL del Logo (Opcional)</Label>
                            <Input name="logoUrl" defaultValue={tenant.logoUrl || ""} placeholder="https://..." />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Pega un link directo a tu imagen. Si lo dejas vacío, se usará solo el nombre.
                            </p>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto">
                                Guardar Cambios
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>

        {/* COLUMNA DERECHA: VISTA PREVIA REALISTA (CON CÁLCULO) */}
        <div className="lg:col-span-1">
            <div className="sticky top-6">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Así se verá tu PDF
                </h3>
                
                {/* SIMULACIÓN DE HOJA DE PAPEL */}
                <div className="bg-white p-6 shadow-lg border border-slate-200 text-black font-sans text-xs min-h-96 flex flex-col relative">
                    
                    {/* ENCABEZADO */}
                    <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-4">
                        <div className="flex flex-col max-w-[70%]">
                            {tenant.logoUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={tenant.logoUrl} alt="Logo" className="h-8 object-contain mb-2 self-start" />
                            )}
                            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none break-all">
                                {tenant.name || "NOMBRE TALLER"}
                            </h1>
                            <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">
                                Orden de Trabajo #001
                            </p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-[9px] uppercase font-bold text-gray-400">Fecha</p>
                            <p className="font-bold">24 dic 2025</p>
                        </div>
                    </div>

                    {/* DATOS DE CONTACTO */}
                    <div className="space-y-1 mb-6 text-left">
                        <p className="font-bold uppercase text-[10px] text-gray-400 mb-1">Contacto Taller</p>
                        <div className="text-sm font-medium break-all">
                            {tenant.address ? <p>📍 {tenant.address}</p> : <p className="text-gray-300 italic">Sin dirección</p>}
                            {tenant.phone ? <p>📞 {tenant.phone}</p> : <p className="text-gray-300 italic">Sin teléfono</p>}
                            {tenant.email ? <p>✉️ {tenant.email}</p> : <p className="text-gray-300 italic">Sin email</p>}
                        </div>
                    </div>

                    {/* TABLA SIMULADA */}
                    <div className="mt-auto">
                        <div className="border-t-2 border-black pt-2 mb-4">
                            <div className="flex justify-between font-bold text-[9px] uppercase text-gray-500 mb-2 px-1">
                                <span>Descripción</span>
                                <span>Total</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100 px-1">
                                <span>Cambio de Aceite</span>
                                <span className="font-bold">$15.000</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100 px-1">
                                <span>Filtro de Aire</span>
                                <span className="font-bold">$5.000</span>
                            </div>
                            {/* Subtotal simulado */}
                            <div className="flex justify-end pt-2 text-gray-500 text-[10px]">
                                <span>Subtotal: {formatMoney(dummySubtotal)}</span>
                            </div>
                        </div>

                        {/* CAJA NEGRA DEL TOTAL */}
                        <div className="flex flex-col items-end">
                            <div className="bg-black text-white px-3 py-1 font-black text-lg">
                                {/* AQUÍ SE MUESTRA EL TOTAL CALCULADO */}
                                TOTAL: {formatMoney(dummyTotal)}
                            </div>
                            
                            {/* DETALLE DEL IVA CALCULADO */}
                            {(taxRate > 0) && (
                                <div className="text-[10px] text-gray-400 font-mono mt-1 text-right">
                                    <div>NETO: {formatMoney(dummySubtotal)}</div>
                                    <div>+ {taxRate}% IVA ({formatMoney(dummyTaxAmount)})</div>
                                </div>
                            )}
                        </div>
                        
                        <div className="text-center mt-6">
                            <p className="text-[8px] text-gray-300 uppercase font-bold">Documento Generado por Nexus Garage OS</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}