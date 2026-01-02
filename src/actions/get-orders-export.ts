"use server";

import { db } from "@/lib/db";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function getOrdersForExport(tenantId: string, range: string) {
  const now = new Date();
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  // 1. Definir rango de fechas
  if (range === "this_month") {
    startDate = startOfMonth(now);
    endDate = endOfMonth(now);
  } else if (range === "last_month") {
    const lastMonth = subMonths(now, 1);
    startDate = startOfMonth(lastMonth);
    endDate = endOfMonth(lastMonth);
  }

  // 2. Buscar Órdenes
  const orders = await db.workOrder.findMany({
    where: {
      tenantId: tenantId,
      deletedAt: null,
      status: { not: "CANCELLED" },
      startDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      // ✅ IMPORTANTE: Traemos los items para calcular el total real
      items: true,
      vehicle: {
        include: { customer: true },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  // 3. Aplanar / Formatear datos para el Excel
  const flattenedData = orders.map((order) => {
    // 🧮 CÁLCULO MANUAL DEL TOTAL (Senior Fix)
    // Sumamos precio * cantidad de cada ítem de la orden
    const calculatedTotal = order.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);

    return {
        id: order.number,
        fecha: order.startDate ? order.startDate.toISOString().split("T")[0] : "-",
        cliente: `${order.vehicle.customer.firstName} ${order.vehicle.customer.lastName}`,
        rut: order.vehicle.customer.taxId || "S/R",
        vehiculo: `${order.vehicle.brand} ${order.vehicle.model}`,
        patente: order.vehicle.plateOrSerial,
        estado: mapStatus(order.status),
        total: calculatedTotal, // ✅ Usamos el total calculado
    };
  });

  return flattenedData;
}

// Helper para traducir estados
function mapStatus(status: string) {
  const map: Record<string, string> = {
    PENDING: "Pendiente",
    IN_PROGRESS: "En Taller",
    WAITING_PARTS: "Esp. Repuestos",
    COMPLETED: "Terminado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
  };
  return map[status] || status;
}