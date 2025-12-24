'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server"; // Usamos auth directamente
import { customerSchema } from "@/lib/schemas";
import { createLog } from "@/lib/create-log";

export async function createCustomer(formData: FormData) {
  // 1. OBTENER EL USUARIO REAL
  const { userId } = await auth();

  if (!userId) {
    throw new Error("No autorizado");
  }

  // 2. OBTENER EL ID DEL TALLER DESDE EL FORMULARIO (NO ADIVINARLO)
  const formTenantId = formData.get("tenantId") as string;
  const formSlug = formData.get("slug") as string;

  // 3. SEGURIDAD CRÍTICA: Verificar que el usuario sea DUEÑO de ese taller específico
  const tenant = await db.tenant.findUnique({
    where: {
        id: formTenantId,
        userId: userId // 🔒 Esto asegura que nadie inyecte un ID de otro taller
    }
  });

  if (!tenant) {
    throw new Error("Taller no encontrado o no autorizado");
  }

  // 4. PROCESAR DATOS
  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    taxId: formData.get("taxId"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    isCompany: formData.get("isCompany"),
  };

  const result = customerSchema.safeParse(rawData);

  if (!result.success) {
    console.error(result.error.flatten());
    throw new Error("Datos inválidos"); // Lanzar error para que el Toast lo detecte
  }

  // 5. GUARDAR CLIENTE (Usando el tenant.id verificado)
  const newCustomer = await db.customer.create({
    data: {
        tenantId: tenant.id, // ✅ Ahora sí usa el ID correcto
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        taxId: result.data.taxId,
        phone: result.data.phone,
        email: result.data.email || "",
        address: result.data.address || "",
        isCompany: result.data.isCompany === "on"
    }
  });

  // 6. LOGS Y REVALIDACIÓN
  await createLog(tenant.id, "CREATE_CUSTOMER", "Customer", newCustomer.id, `${newCustomer.firstName} ${newCustomer.lastName}`);

  revalidatePath(`/${tenant.slug}/customers`);
  
  // ⚠️ IMPORTANTE: ELIMINAMOS EL REDIRECT
  // Al quitar el redirect, evitamos que el Modal detecte un "falso error".
  return { success: true };
}