"use server";

import { db } from "@/lib/db";
import { format, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Interfaz para el retorno estructurado de la acción.
 * Esto ayuda al frontend a saber exactamente qué esperar.
 */
interface RevenueReportData {
  kpi: {
    totalRevenue: number;
    totalNet: number;
    totalTax: number;
    count: number;
  };
  chartData: {
    date: string; // Eje X (ej: "Ene 2026")
    net: number;
    tax: number;
    total: number;
  }[];
  transactions: { // Datos para la tabla detallada
    id: number;
    fecha: string;
    cliente: string;
    rut: string;
    vehiculo: string;
    patente: string;
    estado: string;
    neto: number; // Agregamos neto
    iva: number;  // Agregamos IVA
    total: number;
  }[];
}

export async function getRevenueReport(
  tenantId: string, 
  range: string = "this_month"
): Promise<RevenueReportData> {
  
  // 1. Estrategia de Fechas (Extensible)
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (range) {
    case "last_month":
      const lastMonth = subMonths(now, 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
      break;
    case "all":
      startDate = new Date(2020, 0, 1); // Fecha arbitraria de inicio del negocio
      endDate = endOfDay(now);
      break;
    case "this_month":
    default:
      startDate = startOfMonth(now);
      endDate = endOfDay(now);
      break;
  }

  try {
    // 2. Consulta OPTIMIZADA (Traemos todo lo necesario de una sola vez)
    const orders = await db.workOrder.findMany({
      where: {
        tenantId,
        // Consideramos ingresos reales solo lo cobrado/facturado
        status: { in: ["COMPLETED", "DELIVERED"] }, 
        deletedAt: null,
        updatedAt: { gte: startDate, lte: endDate }, // Usamos updatedAt para reflejar cuándo se cerró el negocio
      },
      select: {
        number: true,
        updatedAt: true,
        status: true,
        totalAmount: true,
        netAmount: true, // ✅ Importante
        taxAmount: true, // ✅ Importante
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
      orderBy: { updatedAt: "asc" } // Orden ascendente para facilitar la creación del gráfico cronológico
    });

    // 3. Procesamiento en Memoria (Single Pass Reduction)
    // Inicializamos acumuladores
    let kpi = { totalRevenue: 0, totalNet: 0, totalTax: 0, count: 0 };
    const chartMap = new Map<string, { net: number; tax: number; total: number }>();
    
    // Mapeamos las transacciones para la tabla al mismo tiempo
    const transactions = orders.map((order) => {
      // A. Acumular KPIs Generales
      kpi.totalRevenue += order.totalAmount;
      kpi.totalNet += order.netAmount;
      kpi.totalTax += order.taxAmount;
      kpi.count += 1;

      // B. Agrupar para Gráfico (Agrupado por Mes o Día según rango)
      // Si el rango es 'all' agrupamos por Mes, si es 'this_month' podríamos agrupar por día si quisieras.
      // Por simplicidad, usaremos Mes-Año.
      const chartKey = format(order.updatedAt, "MMM yyyy", { locale: es });
      
      const currentChartVal = chartMap.get(chartKey) || { net: 0, tax: 0, total: 0 };
      chartMap.set(chartKey, {
        net: currentChartVal.net + order.netAmount,
        tax: currentChartVal.tax + order.taxAmount,
        total: currentChartVal.total + order.totalAmount
      });

      // C. Retornar fila formateada para la Tabla
      return {
        id: order.number,
        fecha: format(order.updatedAt, "dd/MM/yyyy", { locale: es }),
        cliente: `${order.vehicle.customer.firstName} ${order.vehicle.customer.lastName}`,
        rut: order.vehicle.customer.taxId || "N/A",
        vehiculo: `${order.vehicle.brand} ${order.vehicle.model}`,
        patente: order.vehicle.plateOrSerial,
        estado: order.status === 'DELIVERED' ? 'Entregado' : 'Terminado',
        neto: order.netAmount,
        iva: order.taxAmount,
        total: order.totalAmount
      };
    });

    // 4. Convertir el Mapa del gráfico a Array
    const chartData = Array.from(chartMap.entries()).map(([date, values]) => ({
      date, // Eje X
      ...values // net, tax, total
    }));

    // Invertimos las transacciones para mostrar las más recientes primero en la tabla
    transactions.reverse();

    return {
      kpi,
      chartData,
      transactions
    };

  } catch (error) {
    console.error("[GET_REVENUE_REPORT_ERROR]:", error);
    // Retornamos estructura vacía segura para no romper la UI
    return {
      kpi: { totalRevenue: 0, totalNet: 0, totalTax: 0, count: 0 },
      chartData: [],
      transactions: []
    };
  }
}