import { Prisma } from "@prisma/client";

/**
 * Recalcula y actualiza los totales de una orden de trabajo.
 * Puede recibir el cliente normal de Prisma o uno de una transacción.
 */
export async function updateOrderTotals(
  workOrderId: string, 
  tx: Prisma.TransactionClient | typeof import("@/lib/db").db
) {
  // 1. Buscamos solo los datos necesarios de los ítems
  const items = await tx.orderItem.findMany({
    where: { workOrderId },
    select: { price: true, quantity: true }
  });

  // 2. Cálculos limpios
  const netAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxAmount = netAmount * 0.19; // IVA 19%
  const totalAmount = netAmount + taxAmount;

  // 3. Actualización de la orden
  return await tx.workOrder.update({
    where: { id: workOrderId },
    data: {
      netAmount,
      taxAmount,
      totalAmount
    }
  });
}