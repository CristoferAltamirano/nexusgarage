'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function deleteVehicle(vehicleId: string, tenantId: string, slug: string) {
  // 1. Verificar Usuario
  const { userId } = await auth();
  if (!userId) throw new Error("No autorizado");

  // 2. Verificar que el usuario sea dueño del Taller (Seguridad)
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId, userId },
  });

  if (!tenant) throw new Error("No autorizado para realizar esta acción");

  // 3. Soft Delete: Marcamos la fecha de borrado en lugar de borrar el registro
  await db.vehicle.update({
    where: { id: vehicleId },
    data: { deletedAt: new Date() } // Asegúrate que tu modelo Prisma tenga este campo
  });

  // 4. Refrescar la página
  revalidatePath(`/${slug}/vehicles`);
}