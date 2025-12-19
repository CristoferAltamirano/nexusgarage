'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// 1. AGREGAR ÍTEM A LA ORDEN
export async function addItemToOrder(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 1;
  const slug = formData.get("slug") as string;

  // --- VALIDACIÓN DE SEGURIDAD ---
  // Si no se seleccionó ningún producto, cancelamos para que no explote.
  if (!orderId || !productId) {
      console.log("Error: Falta ID de orden o producto");
      return; 
  }

  // Buscamos el producto para saber su precio actual
  const product = await db.serviceProduct.findUnique({ where: { id: productId } });
  
  if (!product) return;

  // Creamos el ítem en la orden
  await db.orderItem.create({
    data: {
      workOrderId: orderId,
      productId: product.id,
      description: product.name, // Copiamos el nombre
      price: product.netPrice,   // Copiamos el precio del momento
      quantity: quantity,
    }
  });

  // ACTUALIZAR TOTALES DE LA ORDEN
  await updateOrderTotals(orderId);

  revalidatePath(`/${slug}/orders/${orderId}`);
}

// 2. ELIMINAR ÍTEM
export async function deleteItemFromOrder(formData: FormData) {
    const itemId = formData.get("itemId") as string;
    const orderId = formData.get("orderId") as string;
    const slug = formData.get("slug") as string;

    if (!itemId) return;

    await db.orderItem.delete({ where: { id: itemId } });
    await updateOrderTotals(orderId); // Recalcular
    
    revalidatePath(`/${slug}/orders/${orderId}`);
}

// 3. FINALIZAR ORDEN (NUEVO)
export async function completeOrder(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const slug = formData.get("slug") as string;

    // Actualizamos el estado a COMPLETED y guardamos la fecha de término
    await db.workOrder.update({
        where: { id: orderId },
        data: { 
            status: "COMPLETED", 
            endDate: new Date() 
        }
    });

    revalidatePath(`/${slug}/orders/${orderId}`);
}

// --- FUNCIÓN AUXILIAR (PRIVADA) PARA RECALCULAR EL DINERO ---
async function updateOrderTotals(orderId: string) {
    // 1. Sumamos todos los ítems de esa orden
    const items = await db.orderItem.findMany({ where: { workOrderId: orderId } });
    
    let netTotal = 0;
    items.forEach(item => {
        netTotal += (item.price * item.quantity);
    });

    // 2. Calculamos IVA (19% Chile)
    const tax = netTotal * 0.19;
    const total = netTotal + tax;

    // 3. Guardamos en la Orden
    await db.workOrder.update({
        where: { id: orderId },
        data: {
            netAmount: netTotal,
            taxAmount: tax,
            totalAmount: total
        }
    });
}