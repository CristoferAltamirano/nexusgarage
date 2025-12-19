'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. Agregar Ítem (Con lógica de Stock)
export async function addItem(formData: FormData) {
  const workOrderId = formData.get("workOrderId") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const quantity = parseInt(formData.get("quantity") as string);
  const productId = formData.get("productId") as string; // <--- Nuevo campo

  if (!workOrderId || !description || !price) return;

  // Creamos el ítem en la orden
  await db.orderItem.create({
    data: {
        workOrderId,
        description,
        price,
        quantity,
        productId: productId || null // Guardamos la referencia si existe
    }
  });

  // GESTIÓN DE STOCK: Si es un producto del inventario, descontamos
  if (productId) {
    const product = await db.serviceProduct.findUnique({ where: { id: productId } });
    
    // Solo descontamos si NO es Mano de Obra (y si existe el producto)
    if (product && product.category !== "Mano de Obra") {
        await db.serviceProduct.update({
            where: { id: productId },
            data: { stock: { decrement: quantity } }
        });
    }
  }

  await updateOrderTotal(workOrderId);
  revalidatePath(`/orders/${workOrderId}`);
}

// 2. Borrar Ítem (Devolver Stock)
export async function deleteItem(itemId: string, workOrderId: string) {
    // Primero buscamos el ítem para saber si tenía un producto asociado
    const item = await db.orderItem.findUnique({ where: { id: itemId } });
    
    if (!item) return;

    // Si tenía producto asociado, DEVOLVEMOS el stock
    if (item.productId) {
        const product = await db.serviceProduct.findUnique({ where: { id: item.productId } });
        if (product && product.category !== "Mano de Obra") {
            await db.serviceProduct.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } }
            });
        }
    }

    // Ahora sí lo borramos
    await db.orderItem.delete({
        where: { id: itemId }
    });

    await updateOrderTotal(workOrderId);
    revalidatePath(`/orders/${workOrderId}`);
}

// Auxiliar: Recalcular totales
async function updateOrderTotal(workOrderId: string) {
    const items = await db.orderItem.findMany({ where: { workOrderId } });
    const netAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const taxAmount = netAmount * 0.19; 
    const totalAmount = netAmount + taxAmount;

    await db.workOrder.update({
        where: { id: workOrderId },
        data: { netAmount, taxAmount, totalAmount }
    });
}