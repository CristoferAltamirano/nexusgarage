'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation"; // <--- Necesario para el mensaje verde
import { getAuthenticatedTenant } from "@/lib/safe-action";
import { settingsSchema } from "@/lib/schemas";
import { createLog } from "@/lib/create-log";

export async function updateSettings(formData: FormData) {
  const tenant = await getAuthenticatedTenant(); // 🔒 Seguridad

  // 🕒 TRUCO PARA PROBAR LOADER (Descomenta la línea de abajo para ver el spinner 2 segundos)
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  const rawData = {
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
    logoUrl: formData.get("logoUrl"), // <--- Agregado para que guarde el logo
  };

  // 🔒 Validación
  const result = settingsSchema.safeParse(rawData);

  if (!result.success) {
    // Si falla, podrías retornar errores aquí, pero por ahora solo retornamos
    return;
  }

  await db.tenant.update({
    where: { id: tenant.id },
    data: {
        name: result.data.name,
        address: result.data.address || "",
        phone: result.data.phone || "",
        email: result.data.email || "",
        website: result.data.website || "",
        // Asegúrate de que tu schema y DB tengan logoUrl, si no, borra esta línea:
        logoUrl: rawData.logoUrl?.toString() || "" 
    }
  });

  // 📸 Foto del cambio
  await createLog(tenant.id, "UPDATE_SETTINGS", "Tenant", tenant.id, "Actualizó datos de empresa");

  // 1. Revalidamos para que se actualicen los datos en pantalla
  revalidatePath(`/${tenant.slug}/settings`);

  // 2. Redirigimos con el parámetro ?success=true para activar la alerta verde
  redirect(`/${tenant.slug}/settings?success=true`);
}