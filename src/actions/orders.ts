"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { Status } from "@prisma/client";
import { createLog } from "@/lib/create-log";
// Asegúrate de que este archivo exista, si no, avísame
import { updateOrderTotals } from "@/lib/order-utils";

/**
 * 1. GUARDAR ORDEN DE TRABAJO (CREAR)
 * Nota: Aquí asumimos la creación básica de la orden desde el modal inicial.
 */
export async function saveOrder(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const formTenantId = formData.get("tenantId")?.toString();
    if (!formTenantId) return { success: false, error: "Falta el ID del taller" };

    // 1. Validar permisos en el taller específico
    const tenant = await db.tenant.findFirst({
      where: {
        id: formTenantId,
        OR: [
            { userId: user.id },
            { users: { some: { id: user.id } } }
        ]
      }
    });

    if (!tenant) return { success: false, error: "No tienes permisos en este taller" };

    const plate = formData.get("plate")?.toString().toUpperCase().trim();
    const description = formData.get("description")?.toString().trim();
    const slug = formData.get("slug")?.toString(); // Slug del taller para revalidar
    
    const kilometer = parseInt(formData.get("kilometer")?.toString() || "0", 10);
    const fuelLevel = parseInt(formData.get("fuelLevel")?.toString() || "0", 10);

    if (!plate || !description) {
      return { success: false, error: "Patente y descripción son obligatorias" };
    }

    const order = await db.$transaction(async (tx) => {
      // Buscar vehículo existente en ESTE taller
      const vehicle = await tx.vehicle.findFirst({
        where: { 
          plateOrSerial: plate, 
          tenantId: tenant.id,
          deletedAt: null 
        }
      });

      if (!vehicle) {
        throw new Error(`El vehículo con patente ${plate} no está registrado en este taller.`);
      }

      // Crear la orden vinculada al vehículo
      const newOrder = await tx.workOrder.create({
        data: {
          tenantId: tenant.id,
          vehicleId: vehicle.id,
          description,
          status: "PENDING",
          kilometer,
          fuelLevel,
          startDate: new Date(),
        }
      });

      await createLog(
        tenant.id, 
        "CREATE_ORDER", 
        "WorkOrder", 
        newOrder.id, 
        `Orden creada para vehículo ${plate}`
      );

      return newOrder;
    });

    if (slug) {
        revalidatePath(`/${slug}/dashboard`);
        revalidatePath(`/${slug}/orders`);
    }

    return { success: true, id: order.id };
  } catch (error: any) {
    console.error("[SAVE_ORDER_ERROR]:", error.message);
    return { success: false, error: error.message || "Error al crear la orden" };
  }
}

/**
 * 2. ELIMINAR ORDEN (SOFT DELETE)
 */
export async function deleteOrder(orderId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    // 1. Buscar la orden para saber su Tenant
    const order = await db.workOrder.findUnique({
        where: { id: orderId }
    });

    if (!order) return { success: false, error: "Orden no encontrada" };

    // 2. Validar permisos en ESE tenant
    const tenant = await db.tenant.findFirst({
        where: {
            id: order.tenantId,
            OR: [
                { userId: user.id },
                { users: { some: { id: user.id } } }
            ]
        }
    });

    if (!tenant) return { success: false, error: "No tienes permiso para eliminar esta orden" };

    await db.$transaction(async (tx) => {
      // Soft Delete
      await tx.workOrder.update({
        where: { id: orderId },
        data: { deletedAt: new Date() }
      });

      await createLog(tenant.id, "DELETE_ORDER", "WorkOrder", orderId, `Orden eliminada`);
    });

    // Revalidamos la ruta principal de órdenes
    revalidatePath(`/${tenant.slug}/orders`);
    revalidatePath(`/${tenant.slug}/dashboard`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 3. AGREGAR ÍTEM A LA ORDEN
 */
export async function addOrderItem(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const orderId = formData.get("orderId") as string;
    const productId = formData.get("productId") as string;
    const quantity = parseInt(formData.get("quantity") as string, 10) || 1;
    const slug = formData.get("slug") as string;

    // Buscar orden para obtener tenantId
    const order = await db.workOrder.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, error: "Orden no encontrada" };

    // Validar permisos en el tenant de la orden
    const tenant = await db.tenant.findFirst({
        where: {
            id: order.tenantId,
            OR: [
                { userId: user.id },
                { users: { some: { id: user.id } } }
            ]
        }
    });

    if (!tenant) return { success: false, error: "No autorizado" };

    await db.$transaction(async (tx) => {
      const product = await tx.serviceProduct.findUnique({ where: { id: productId } });
      
      if (!product || product.tenantId !== tenant.id) {
          throw new Error("Producto no válido o de otro taller");
      }

      // Descontar stock si no es mano de obra
      if (product.category !== "Mano de Obra") {
        if (product.stock < quantity) throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
        
        await tx.serviceProduct.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } }
        });
      }

      await tx.orderItem.create({
        data: {
          workOrderId: orderId,
          productId: product.id,
          description: product.name,
          price: product.netPrice,
          quantity
        }
      });

      // Actualizar totales de la orden
      await updateOrderTotals(orderId, tx);
    });

    revalidatePath(`/${slug}/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 4. ELIMINAR ÍTEM
 */
export async function deleteOrderItem(itemId: string, orderId: string, slug: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    // Buscar orden para validar permisos
    const order = await db.workOrder.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, error: "Orden no encontrada" };

    const tenant = await db.tenant.findFirst({
        where: {
            id: order.tenantId,
            OR: [
                { userId: user.id },
                { users: { some: { id: user.id } } }
            ]
        }
    });

    if (!tenant) return { success: false, error: "No autorizado" };

    await db.$transaction(async (tx) => {
      const item = await tx.orderItem.findUnique({
        where: { id: itemId },
        include: { product: true }
      });

      if (!item) throw new Error("Ítem no encontrado");

      // Devolver stock si aplica
      if (item.productId && item.product?.category !== "Mano de Obra") {
        await tx.serviceProduct.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      await tx.orderItem.delete({ where: { id: itemId } });
      await updateOrderTotals(orderId, tx);
    });

    revalidatePath(`/${slug}/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 5. ACTUALIZAR ESTADO DE LA ORDEN
 */
export async function updateOrderStatus(orderId: string, newStatus: string, slug: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const order = await db.workOrder.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, error: "Orden no encontrada" };

    const tenant = await db.tenant.findFirst({
        where: {
            id: order.tenantId,
            OR: [
                { userId: user.id },
                { users: { some: { id: user.id } } }
            ]
        }
    });

    if (!tenant) return { success: false, error: "No autorizado" };

    const nextStatus = newStatus as Status;

    await db.$transaction(async (tx) => {
      const isFinished = nextStatus === "COMPLETED" || nextStatus === "DELIVERED";

      await tx.workOrder.update({
        where: { id: orderId },
        data: {
          status: nextStatus,
          endDate: isFinished ? new Date() : null
        }
      });

      await createLog(tenant.id, "UPDATE_STATUS", "WorkOrder", orderId, `Estado cambiado a: ${nextStatus}`);
    });

    revalidatePath(`/${slug}/orders/${orderId}`);
    revalidatePath(`/${slug}/dashboard`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}