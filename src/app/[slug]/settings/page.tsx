import { db } from "@/lib/db";
import { updateSettings } from "@/actions/update-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, MapPin, Phone, Mail, Globe, CheckCircle2 } from "lucide-react";

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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="col-span-2">
            <form action={updateSettings}>
                <input type="hidden" name="tenantId" value={tenant.id} />
                <input type="hidden" name="slug" value={tenant.slug} />

                <Card>
                    <CardHeader>
                        <CardTitle>Datos del Taller</CardTitle>
                        <CardDescription>
                            Esta información aparecerá en los encabezados de tus órdenes de trabajo PDF.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        
                        {/* Mensaje de éxito */}
                        {showSuccess && (
                            <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center gap-2 text-sm border border-green-200">
                                <CheckCircle2 size={16} />
                                ¡Datos actualizados correctamente!
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Nombre del Taller</Label>
                            <div className="relative">
                                <Store className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input name="name" defaultValue={tenant.name} className="pl-9" />
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
                                Por ahora, pega un link directo a tu imagen (ej: Google Drive, Imgur, o tu web).
                            </p>
                        </div>

                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            Guardar Cambios
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>

        {/* COLUMNA DERECHA: VISTA PREVIA */}
        <div>
            <Card className="bg-slate-50 border-dashed">
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">Vista Previa Impresión</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-white p-6 shadow-sm border text-center space-y-2">
                        {tenant.logoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={tenant.logoUrl} alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
                        )}
                        <h3 className="font-bold text-xl">{tenant.name}</h3>
                        <p className="text-sm text-slate-500">{tenant.address || "Sin dirección"}</p>
                        <p className="text-sm text-slate-500">{tenant.phone || "Sin teléfono"}</p>
                        <p className="text-sm text-slate-500">{tenant.email || "Sin email"}</p>
                        
                        <div className="mt-6 pt-4 border-t w-full text-left">
                            <div className="h-4 bg-slate-100 w-1/3 mb-2 rounded"></div>
                            <div className="h-4 bg-slate-100 w-full mb-2 rounded"></div>
                            <div className="h-4 bg-slate-100 w-2/3 rounded"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}