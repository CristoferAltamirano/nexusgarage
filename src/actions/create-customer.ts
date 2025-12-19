'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthenticatedTenant } from "@/lib/safe-action";
import { customerSchema } from "@/lib/schemas";
import { createLog } from "@/lib/create-log";

export async function createCustomer(formData: FormData) {
  const tenant = await getAuthenticatedTenant(); // 🔒 Capa 1 y 2

  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    taxId: formData.get("taxId"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    isCompany: formData.get("isCompany"),
  };

  const result = customerSchema.safeParse(rawData); // 🔒 Capa 3: Zod

  if (!result.success) {
    console.error(result.error.flatten());
    return;
  }

  const newCustomer = await db.customer.create({
    data: {
        tenantId: tenant.id,
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        taxId: result.data.taxId,
        phone: result.data.phone,
        email: result.data.email || "",
        address: result.data.address || "",
        isCompany: result.data.isCompany === "on"
    }
  });

  // 📸 Capa 4: Auditoría
  await createLog(tenant.id, "CREATE_CUSTOMER", "Customer", newCustomer.id, `${newCustomer.firstName} ${newCustomer.lastName}`);

  revalidatePath(`/${tenant.slug}/customers`);
}