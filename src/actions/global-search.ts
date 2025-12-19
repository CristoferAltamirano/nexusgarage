'use server'

import { db } from "@/lib/db";

export async function searchGlobal(query: string, tenantId: string) {
  if (!query || query.length < 2) return { customers: [], vehicles: [] };

  // 1. Buscar Clientes (Por nombre, apellido o RUT)
  const customers = await db.customer.findMany({
    where: {
      tenantId,
      OR: [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { taxId: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 5,
  });

  // 2. Buscar Vehículos (Por patente, marca o modelo)
  const vehicles = await db.vehicle.findMany({
    where: {
      tenantId,
      OR: [
        { plateOrSerial: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } },
        { model: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { customer: true }, // Incluimos al dueño para mostrarlo
    take: 5,
  });

  return { customers, vehicles };
}