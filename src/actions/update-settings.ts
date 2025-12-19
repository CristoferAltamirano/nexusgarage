'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthenticatedTenant } from "@/lib/safe-action";
import { settingsSchema } from "@/lib/schemas";
import { createLog } from "@/lib/create-log";

export async function updateSettings(formData: FormData) {
  const tenant = await getAuthenticatedTenant(); // 🔒 Seguridad

  const rawData = {
    name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
  };

  const result = settingsSchema.safeParse(rawData); // 🔒 Validación

  if (!result.success) return;

  await db.tenant.update({
    where: { id: tenant.id },
    data: {
        name: result.data.name,
        address: result.data.address || "",
        phone: result.data.phone || "",
        email: result.data.email || "",
        website: result.data.website || ""
    }
  });

  // 📸 Foto del cambio
  await createLog(tenant.id, "UPDATE_SETTINGS", "Tenant", tenant.id, "Actualizó datos de empresa");

  revalidatePath(`/${tenant.slug}/settings`);
}