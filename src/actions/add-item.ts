"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addOrderItem(orderId: string, description: string, quantity: number, price: number) {
  try {
    // 1. Crear el Ítem usando 'price' (nombre correcto en tu BD)
    await db.orderItem.create({
      data: {
        workOrderId: orderId,
        description,
        quantity,
        price, // 👈 Cambiado de unitPrice a price
      },
    });

    // 2. 🧠 RECÁLCULO
    const allItems = await db.orderItem.findMany({
      where: { workOrderId: orderId },
    });

    // Usamos item.price aquí también
    const newTotal = allItems.reduce((acc, item) => {
      return acc + (item.quantity * item.price); // 👈 Cambiado aquí también
    }, 0);

    // 3. Actualizar la Orden
    const updatedOrder = await db.workOrder.update({
      where: { id: orderId },
      data: { totalAmount: newTotal },
      include: { tenant: true }
    });

    // 4. Refrescar
    revalidatePath(`/${updatedOrder.tenant.slug}/orders/${orderId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error agregando ítem:", error);
    return { success: false, error: "No se pudo agregar el ítem" };
  }
}