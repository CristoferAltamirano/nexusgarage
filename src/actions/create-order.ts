'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation"; // 👈 1. IMPORTA ESTO
import { getAuthenticatedTenant } from "@/lib/safe-action";
import { orderSchema } from "@/lib/schemas";
import { createLog } from "@/lib/create-log";

export async function createOrder(formData: FormData) {
  const tenant = await getAuthenticatedTenant(); 

  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    taxId: formData.get("taxId"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    plate: formData.get("plate"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    description: formData.get("description"),
    kilometer: formData.get("kilometer"),
    fuelLevel: formData.get("fuelLevel"),
  };

  const result = orderSchema.safeParse(rawData);

  if (!result.success) {
    console.log(result.error.flatten());
    return;
  }

  const { firstName, lastName, taxId, email, phone, plate, brand, model, description, kilometer, fuelLevel } = result.data;

  // 1. Cliente
  let customer = await db.customer.findFirst({
    where: { tenantId: tenant.id, taxId: taxId || "undefined" }
  });

  if (!customer) {
    customer = await db.customer.create({
        data: { tenantId: tenant.id, firstName, lastName, taxId, email, phone, address: "" }
    });
  }

  // 2. Vehículo
  let vehicle = await db.vehicle.findFirst({
    where: { tenantId: tenant.id, plateOrSerial: plate }
  });

  if (!vehicle) {
    vehicle = await db.vehicle.create({
        data: { tenantId: tenant.id, customerId: customer.id, type: "CAR", brand, model, plateOrSerial: plate, color: "Desconocido" }
    });
  }

  // 3. Crear Orden
  const newOrder = await db.workOrder.create({
    data: {
        tenantId: tenant.id,
        vehicleId: vehicle.id,
        description,
        kilometer,
        fuelLevel,
        status: "PENDING",
        number: undefined,
    }
  });

  // Log
  await createLog(tenant.id, "CREATE_ORDER", "WorkOrder", newOrder.id, `Orden #${newOrder.number} - ${plate}`);

  // Limpiar caché
  revalidatePath(`/${tenant.slug}/dashboard`);
  revalidatePath(`/${tenant.slug}/orders`);

  // 👇 2. EL PASO FINAL: Redirigir para forzar la actualización visual
  redirect(`/${tenant.slug}/orders`);
}