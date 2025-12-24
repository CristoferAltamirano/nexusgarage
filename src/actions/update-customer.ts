'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { customerSchema } from "@/lib/schemas";
import { createLog } from "@/lib/create-log";
// Borramos el import de redirect, lo haremos en el cliente

export async function updateCustomer(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autorizado");

  const customerId = formData.get("id") as string;
  const tenantId = formData.get("tenantId") as string;
  const slug = formData.get("slug") as string;

  const tenant = await db.tenant.findUnique({
    where: { id: tenantId, userId }
  });

  if (!tenant) throw new Error("No autorizado");

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
    // 🔥 CAMBIO 1: En vez de return objeto, lanzamos error
    throw new Error("Datos inválidos");
  }

  await db.customer.update({
    where: { id: customerId },
    data: {
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      taxId: result.data.taxId,
      phone: result.data.phone,
      email: result.data.email || "",
      address: result.data.address || "",
      isCompany: result.data.isCompany === "on"
    }
  });

  await createLog(tenantId, "UPDATE_CUSTOMER", "Customer", customerId, `${result.data.firstName} ${result.data.lastName}`);
  
  // Refrescamos la cache
  revalidatePath(`/${slug}/customers`);
  
  // 🔥 CAMBIO 2: No retornamos nada (void) ni redirigimos aquí.
}