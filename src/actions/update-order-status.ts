'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Status } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

export async function updateOrderStatus(orderId: string, newStatus: string, path?: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("No autorizado");
  }

  // Validamos que el status sea uno de los permitidos
  const validStatuses = Object.values(Status);
  
  if (!validStatuses.includes(newStatus as Status)) return;

  // Actualizamos la fecha de término si se completa o entrega
  const isFinished = newStatus === "COMPLETED" || newStatus === "DELIVERED";
  
  await db.workOrder.update({
    where: { id: orderId },
    data: {
        status: newStatus as Status,
        endDate: isFinished ? new Date() : null // Guardamos fecha de término real
    }
  });

  if (path) {
    revalidatePath(path);
  } else {
    revalidatePath(`/orders/${orderId}`);
  }
}
