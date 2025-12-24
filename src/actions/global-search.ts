"use server";

import { db } from "@/lib/db";

export async function searchGlobal(query: string, tenantId: string) {
  // Validación temprana para evitar consultas innecesarias
  if (!query || query.trim().length < 2) {
    return { customers: [], vehicles: [] };
  }

  const searchTerm = query.trim();

  try {
    // Ejecutamos ambas búsquedas en paralelo para mayor velocidad
    const [customers, vehicles] = await Promise.all([
      // 1. Buscar Clientes (Optimizado)
      db.customer.findMany({
        where: {
          tenantId,
          deletedAt: null, // 👈 Filtro esencial para Soft Delete
          OR: [
            { firstName: { contains: searchTerm, mode: "insensitive" } },
            { lastName: { contains: searchTerm, mode: "insensitive" } },
            { taxId: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          taxId: true,
          phone: true, // Útil para contactarlo rápido desde la búsqueda
        },
        take: 5,
      }),

      // 2. Buscar Vehículos (Optimizado)
      db.vehicle.findMany({
        where: {
          tenantId,
          deletedAt: null, // 👈 Filtro esencial para Soft Delete
          OR: [
            { plateOrSerial: { contains: searchTerm, mode: "insensitive" } },
            { brand: { contains: searchTerm, mode: "insensitive" } },
            { model: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          plateOrSerial: true,
          brand: true,
          model: true,
          customer: {
            select: {
              firstName: true,
              lastName: true,
            }
          }
        },
        take: 5,
      }),
    ]);

    return { customers, vehicles };

  } catch (error) {
    console.error("[SEARCH_GLOBAL_ERROR]:", error);
    return { customers: [], vehicles: [] };
  }
}