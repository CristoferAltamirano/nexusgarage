"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteOrderItem(itemId: string, orderId: string) {
  try {
    // 1. Borrar el ítem
    await db.orderItem.delete({
      where: { id: itemId },
    });

    // 2. Recalcular el nuevo total
    const allItems = await db.orderItem.findMany({
      where: { workOrderId: orderId },
    });

    const newTotal = allItems.reduce((acc, item) => {
      return acc + (item.quantity * item.price);
    }, 0);

    // 3. Actualizar la orden principal
    const updatedOrder = await db.workOrder.update({
      where: { id: orderId },
      data: { totalAmount: newTotal },
      include: { tenant: true }
    });

    // 4. Refrescar la página
    revalidatePath(`/${updatedOrder.tenant.slug}/orders/${orderId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error al borrar ítem:", error);
    return { success: false, error: "No se pudo eliminar el ítem" };
  }
}