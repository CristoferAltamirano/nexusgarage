"use server";

import { db } from "@/lib/db";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";

export async function getRevenueReport(tenantId: string, range?: string) {
  let startDate: Date;
  let endDate: Date;

  // 1. Lógica de rangos simplificada con date-fns
  const now = new Date();
  
  switch (range) {
    case "last_month":
      const lastMonth = subMonths(now, 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
      break;
    case "all":
      // Reemplazamos startOfCentury por una fecha base confiable
      startDate = new Date(2000, 0, 1); 
      endDate = now;
      break;
    default: // "this_month"
      startDate = startOfMonth(now);
      endDate = now;
  }

  try {
    // 2. Consulta OPTIMIZADA (Lean Query)
    const orders = await db.workOrder.findMany({
      where: {
        tenantId,
        status: { in: ["COMPLETED", "DELIVERED"] },
        deletedAt: null,
        startDate: { gte: startDate, lte: endDate },
      },
      // Solo traemos las columnas necesarias para el reporte
      select: {
        number: true,
        startDate: true,
        status: true,
        totalAmount: true,
        vehicle: {
          select: {
            brand: true,
            model: true,
            plateOrSerial: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                taxId: true,
              }
            }
          }
        }
      },
      orderBy: { startDate: "desc" }
    });

    // 3. Mapeo a objeto plano para el componente de la tabla
    return orders.map(order => ({
      id: order.number,
      fecha: format(order.startDate, "dd/MM/yyyy", { locale: es }),
      cliente: `${order.vehicle.customer.firstName} ${order.vehicle.customer.lastName}`,
      rut: order.vehicle.customer.taxId || "Sin RUT",
      vehiculo: `${order.vehicle.brand} ${order.vehicle.model}`,
      patente: order.vehicle.plateOrSerial,
      estado: order.status === 'DELIVERED' ? 'Entregado' : 'Terminado',
      total: order.totalAmount
    }));

  } catch (error) {
    console.error("[GET_REVENUE_REPORT_ERROR]:", error);
    return []; // Retornamos array vacío para evitar que la tabla rompa la UI
  }
}