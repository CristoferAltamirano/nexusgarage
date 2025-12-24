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
 * Se usa durante el onboarding inicial.
 */
export async function registerTenant(formData: FormData) {
  const { userId } = await auth();
  const name = formData.get("name")?.toString().trim();

  if (!name) return { success: false, error: "El nombre es obligatorio" };

  // Si no hay usuario, redirigimos a login guardando el nombre intentado
  if (!userId) {
    const encodedName = encodeURIComponent(name);
    redirect(`/?pending_tenant=${encodedName}`);
  }

  const user = await currentUser();
  if (!user) return { success: false, error: "Usuario no encontrado" };

  // Generar Slug limpio (ej: "Taller Juan" -> "taller-juan")
  const baseSlug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  try {
    const finalSlug = await db.$transaction(async (tx) => {
      // Verificar disponibilidad de slug
      const existing = await tx.tenant.findUnique({ where: { slug: baseSlug } });
      const slugToUse = existing 
        ? `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}` 
        : baseSlug;

      // Crear el Tenant (Taller)
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug: slugToUse,
          userId: user.id,
        }
      });

      // Sincronizar usuario Clerk con nuestra tabla local User
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
 * Se usa desde el panel de configuración del taller.
 */
export async function updateSettings(formData: FormData) {
  const tenant = await getAuthenticatedTenant();
  let targetPath = `/${tenant.slug}/settings`;

  try {
    const rawData = Object.fromEntries(formData.entries());
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
          logoUrl: rawData.logoUrl?.toString() || ""
        }
      });

      await createLog(tenant.id, "UPDATE_SETTINGS", "Tenant", tenant.id, "Actualización de perfil corporativo");
    });

    revalidatePath(targetPath);
    targetPath += "?success=true";

  } catch (error) {
    console.error("[UPDATE_SETTINGS_ERROR]:", error);
    return { success: false, error: "No se pudieron guardar los cambios" };
  }

  // El redirect siempre fuera del try/catch
  redirect(targetPath);
}