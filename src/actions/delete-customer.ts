'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function deleteCustomer(customerId: string, tenantId: string, slug: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    // 1. Verificar Seguridad (Dueño del taller)
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId, userId },
    });

    if (!tenant) throw new Error("No tienes permisos en este taller");

    // 2. Soft Delete (Marcar como borrado)
    await db.customer.update({
      where: { 
        id: customerId,
        tenantId: tenant.id // Aseguramos que pertenezca al taller
      },
      data: { deletedAt: new Date() }
    });

    // 3. Refrescar la lista
    revalidatePath(`/${slug}/customers`);
    
    return { success: true };

  } catch (error) {
    console.error("Error deleting customer:", error);
    throw new Error("No se pudo eliminar el cliente");
  }
}