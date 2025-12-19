"use server";

import { db } from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Aceptamos un objeto range opcional
export async function getRevenueReport(tenantId: string, range?: string) {
  let startDate = new Date();
  let endDate = new Date();

  // Lógica de rangos
  if (range === "last_month") {
    // Mes Pasado Completo (ej: Si estamos en Feb, esto es 1 Ene - 31 Ene)
    startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setDate(1); // Primer día del mes pasado
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date();
    endDate.setMonth(endDate.getMonth()); // Mes actual
    endDate.setDate(0); // Día 0 del mes actual = Último día del mes pasado
    endDate.setHours(23, 59, 59, 999);
  } else if (range === "all") {
    // Todos los tiempos (Ponemos una fecha muy antigua)
    startDate = new Date(2000, 0, 1);
    endDate = new Date(); // Hasta hoy
  } else {
    // "this_month" (Por defecto): Desde el 1 del mes actual hasta hoy
    startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date();
  }

  const orders = await db.workOrder.findMany({
    where: {
      tenantId: tenantId,
      status: { in: ["COMPLETED", "DELIVERED"] },
      deletedAt: null,
      // Filtramos por el rango calculado
      startDate: { 
        gte: startDate,
        lte: endDate
      },
    },
    include: {
      vehicle: {
        include: { customer: true }
      }
    },
    orderBy: { startDate: "desc" }
  });

  const reportData = orders.map(order => ({
    id: order.number,
    fecha: format(order.startDate, "dd/MM/yyyy", { locale: es }),
    cliente: `${order.vehicle.customer.firstName} ${order.vehicle.customer.lastName}`,
    rut: order.vehicle.customer.taxId,
    vehiculo: `${order.vehicle.brand} ${order.vehicle.model}`,
    patente: order.vehicle.plateOrSerial,
    estado: order.status === 'DELIVERED' ? 'Entregado' : 'Terminado',
    total: order.totalAmount
  }));

  return reportData;
}