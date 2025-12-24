"use server";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { settingsSchema } from "@/lib/schemas";
import { createLog } from "@/lib/create-log";
import { getAuthenticatedTenant } from "@/lib/safe-action";

/**
 * 1. REGISTRO DE NUEVO TALLER (TENANT)
 */
export async function registerTenant(formData: FormData) {
  const { userId } = await auth();
  const name = formData.get("name")?.toString().trim();

  if (!name) return { success: false, error: "El nombre es obligatorio" };

  if (!userId) {
    const encodedName = encodeURIComponent(name);
    redirect(`/?pending_tenant=${encodedName}`);
  }

  const user = await currentUser();
  if (!user) return { success: false, error: "Usuario no encontrado" };

  const baseSlug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  try {
    const finalSlug = await db.$transaction(async (tx) => {
      const existing = await tx.tenant.findUnique({ where: { slug: baseSlug } });
      const slugToUse = existing 
        ? `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}` 
        : baseSlug;

      const tenant = await tx.tenant.create({
        data: {
          name,
          slug: slugToUse,
          userId: user.id,
        }
      });

      await tx.user.create({
        data: {
          id: user.id,
          email: user.emailAddresses[0].emailAddress,
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
          role: "ADMIN",
          tenantId: tenant.id
        }
      });

      return slugToUse;
    });

    redirect(`/${finalSlug}/dashboard`);
  } catch (error: any) {
    console.error("[REGISTER_TENANT_ERROR]:", error);
    return { success: false, error: "Error al crear el taller" };
  }
}

/**
 * 2. ACTUALIZACIÓN DE CONFIGURACIÓN (SETTINGS)
 * He agregado el soporte para taxRate (IVA)
 */
export async function updateSettings(formData: FormData) {
  const tenant = await getAuthenticatedTenant();
  let targetPath = `/${tenant.slug}/settings`;

  try {
    const rawData = Object.fromEntries(formData.entries());
    
    // Capturamos el taxRate manualmente antes de validar
    const taxRate = rawData.taxRate ? parseFloat(rawData.taxRate.toString()) : 0;

    const result = settingsSchema.safeParse(rawData);

    if (!result.success) {
      return { 
        success: false, 
        errors: result.error.flatten().fieldErrors 
      };
    }

    await db.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id: tenant.id },
        data: {
          name: result.data.name,
          address: result.data.address ?? "",
          phone: result.data.phone ?? "",
          email: result.data.email ?? "",
          website: result.data.website ?? "",
          logoUrl: rawData.logoUrl?.toString() || "",
          taxRate: taxRate // ✅ ACTUALIZADO: Guardamos el IVA en la base de datos
        }
      });

      await createLog(tenant.id, "UPDATE_SETTINGS", "Tenant", tenant.id, "Actualización de perfil corporativo e impuestos");
    });

    revalidatePath(targetPath);
    revalidatePath(`/${tenant.slug}/orders/[orderId]`); // Revalidamos órdenes para ver el nuevo IVA
    targetPath += "?success=true";

  } catch (error) {
    console.error("[UPDATE_SETTINGS_ERROR]:", error);
    return { success: false, error: "No se pudieron guardar los cambios" };
  }

  redirect(targetPath);
}