'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthenticatedTenant } from "@/lib/safe-action";
import { orderSchema } from "@/lib/schemas";
import { createLog } from "@/lib/create-log";

export async function createOrder(formData: FormData) {
  const tenant = await getAuthenticatedTenant(); // 🔒 Seguridad

  // Extraemos TODO del formulario para validarlo
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

  // 🛡️ Validación Zod
  const result = orderSchema.safeParse(rawData);

  if (!result.success) {
    console.log(result.error.flatten());
    return;
  }

  const { firstName, lastName, taxId, email, phone, plate, brand, model, description, kilometer, fuelLevel } = result.data;

  // 1. Buscar o Crear Cliente (Seguro)
  let customer = await db.customer.findFirst({
    where: { tenantId: tenant.id, taxId: taxId || "undefined" } // Evitamos buscar nulls
  });

  if (!customer) {
    customer = await db.customer.create({
        data: { tenantId: tenant.id, firstName, lastName, taxId, email, phone, address: "" }
    });
  }

  // 2. Buscar o Crear Vehículo (Seguro)
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
        number: undefined, // Dejamos que autoincrement actúe
    }
  });

  // 📸 Log
  await createLog(tenant.id, "CREATE_ORDER", "WorkOrder", newOrder.id, `Orden #${newOrder.number} - ${plate}`);

  revalidatePath(`/${tenant.slug}/dashboard`);
  revalidatePath(`/${tenant.slug}/orders`);
}