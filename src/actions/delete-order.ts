'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function deleteOrder(orderId: string, tenantId: string, slug: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autorizado");

  // Verificar que el usuario es dueño del taller
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId, userId },
  });

  if (!tenant) throw new Error("No autorizado");

  // Soft Delete (Marcamos como borrada en vez de eliminarla)
  await db.workOrder.update({
    where: { id: orderId },
    data: { deletedAt: new Date() }
  });

  revalidatePath(`/${slug}/orders`);
}