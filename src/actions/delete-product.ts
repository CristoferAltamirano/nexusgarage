'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function deleteProduct(productId: string, tenantId: string, slug: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    // 1. VERIFICAR SEGURIDAD (Dueño del taller correcto)
    const tenant = await db.tenant.findUnique({
      where: {
        id: tenantId,
        userId: userId
      }
    });

    if (!tenant) throw new Error("No tienes permisos en este taller");

    // 2. SOFT DELETE (Marcar como borrado)
    await db.serviceProduct.update({
      where: { 
        id: productId,
        tenantId: tenant.id // Aseguramos que el producto pertenezca al taller
      },
      data: { deletedAt: new Date() }
    });

    // 3. REFRESCAR LA LISTA
    revalidatePath(`/${slug}/settings/catalog`);
    
    return { success: true };

  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("No se pudo eliminar el ítem");
  }
}