"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { createLog } from "@/lib/create-log";

export async function updateSettings(formData: FormData) {
  // Variable para guardar la ruta de redirección
  let targetPath = "";

  try {
    // 1. Autenticación
    const user = await currentUser();
    if (!user) throw new Error("No autorizado");

    // 2. Obtener ID del taller desde el formulario
    const formTenantId = formData.get("tenantId")?.toString();
    if (!formTenantId) throw new Error("Falta el ID del taller");

    // 3. ✅ SEGURIDAD CONTEXTUAL
    // Verificamos permisos en el taller específico.
    const tenant = await db.tenant.findFirst({
      where: {
        id: formTenantId,
        OR: [
          { userId: user.id },             // Dueño
          { users: { some: { id: user.id } } } // Empleado
        ]
      }
    });

    if (!tenant) throw new Error("No tienes permisos para editar este taller");

    // Definimos la ruta de destino usando el slug CORRECTO
    targetPath = `/${tenant.slug}/settings`;

    // 4. Extracción de datos
    const name = formData.get("name")?.toString();
    const phone = formData.get("phone")?.toString();
    const email = formData.get("email")?.toString();
    const address = formData.get("address")?.toString();
    const website = formData.get("website")?.toString();
    const logoUrl = formData.get("logoUrl")?.toString();
    
    // Capturamos el taxRate y lo convertimos a número
    const taxRateString = formData.get("taxRate")?.toString();
    const taxRate = taxRateString ? parseFloat(taxRateString) : undefined;

    // 5. Actualización en Base de Datos
    await db.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id: tenant.id },
        data: {
          name,
          phone,
          email,
          address,
          website,
          // Agregamos el campo de impuesto si existe
          ...(taxRate !== undefined ? { taxRate } : {}),
          // Solo actualizamos logo si viene un valor
          ...(logoUrl ? { logoUrl } : {})
        }
      });

      await createLog(
        tenant.id, 
        "UPDATE_SETTINGS", 
        "Tenant", 
        tenant.id, 
        "Actualizó la información corporativa y configuración"
      );
    });

    // 6. Revalidar caché
    revalidatePath(targetPath);
    revalidatePath(`/${tenant.slug}/dashboard`);
    revalidatePath(`/${tenant.slug}`);
    
    // Si tienes una ruta específica de impresión, revalídala también para corregir el error que te salía
    revalidatePath(`/${tenant.slug}/orders/[orderId]/print`); 

    // Agregamos parámetro de éxito
    targetPath += "?success=true";

  } catch (error: any) {
    console.error("[UPDATE_SETTINGS_ERROR]:", error);
    return { success: false, error: "No se pudieron guardar los cambios" };
  }

  // 7. Redirección final
  if (targetPath) {
    redirect(targetPath);
  }
}