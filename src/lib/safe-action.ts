import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * NIVEL 1: SEGURIDAD ESTÁNDAR
 * Verifica que el usuario esté logueado y tenga un taller asociado.
 * Úsalo para: Ver datos, crear órdenes, agregar clientes.
 */
export async function getAuthenticatedTenant() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("No autorizado: Debes iniciar sesión.");
  }

  // Buscamos el taller asociado a este usuario
  // NOTA: Si en el futuro agregas empleados, aquí deberías buscar
  // en la tabla 'User' para ver a qué tenant pertenecen.
  // Por ahora, asumimos que el usuario logueado es el dueño (Tenant.userId).
  const tenant = await db.tenant.findFirst({
    where: { 
        userId: userId 
    }
  });

  if (!tenant) {
    // Si no tiene taller, lo mandamos a crear uno (o lanzamos error)
    throw new Error("No autorizado: No se encontró un taller para este usuario.");
  }

  return tenant;
}

/**
 * NIVEL 2: SEGURIDAD DE ADMINISTRADOR (DUEÑO)
 * Verifica que el usuario sea EL DUEÑO creador del taller.
 * Úsalo para: Borrar inventario, cambiar configuración de empresa, borrar usuarios.
 */
export async function getAdminTenant() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("No autorizado.");
  }

  const tenant = await db.tenant.findFirst({
    where: { userId: userId }
  });

  if (!tenant) {
    throw new Error("Taller no encontrado.");
  }

  // VERIFICACIÓN ESTRICTA:
  // Solo permitimos pasar si el ID del usuario actual coincide EXATAMENTE
  // con el ID del creador del taller.
  if (tenant.userId !== userId) {
    throw new Error("Acceso Denegado: Se requieren permisos de Administrador.");
  }

  return tenant;
}