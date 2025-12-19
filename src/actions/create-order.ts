'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedTenant } from "@/lib/safe-action";
import { orderSchema } from "@/lib/schemas";
import { createLog } from "@/lib/create-log";

export async function createOrder(formData: FormData) {
  try {
    const tenant = await getAuthenticatedTenant(); 

    // 1. CONVERSIÓN DE DATOS (Aquí estaba el error)
    // Convertimos "kilometer" y "fuelLevel" a números reales.
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
      // 👇 La magia: Si viene vacío ponemos 0, si viene texto lo hacemos número
      kilometer: Number(formData.get("kilometer") || 0), 
      fuelLevel: Number(formData.get("fuelLevel") || 0),
    };

    console.log("📦 Datos recibidos:", rawData); // Esto saldrá en tu terminal

    // 2. Validación Zod
    const result = orderSchema.safeParse(rawData);

    if (!result.success) {
      console.error("❌ Error de Validación:", result.error.flatten());
      return { success: false, error: "Datos inválidos (Revisa la terminal)" };
    }

    const { firstName, lastName, taxId, email, phone, plate, brand, model, description, kilometer, fuelLevel } = result.data;

    // 3. Lógica de Base de Datos
    
    // Buscar/Crear Cliente
    let customer = await db.customer.findFirst({
      where: { tenantId: tenant.id, taxId: taxId || "undefined" }
    });

    if (!customer) {
      customer = await db.customer.create({
          data: { tenantId: tenant.id, firstName, lastName, taxId, email, phone, address: "" }
      });
    }

    // Buscar/Crear Vehículo
    let vehicle = await db.vehicle.findFirst({
      where: { tenantId: tenant.id, plateOrSerial: plate }
    });

    if (!vehicle) {
      vehicle = await db.vehicle.create({
          data: { tenantId: tenant.id, customerId: customer.id, type: "CAR", brand, model, plateOrSerial: plate, color: "Desconocido" }
      });
    }

    // Crear la Orden
    const newOrder = await db.workOrder.create({
      data: {
          tenantId: tenant.id,
          vehicleId: vehicle.id,
          description,
          kilometer,
          fuelLevel,
          status: "PENDING",
      }
    });

    console.log("✅ Orden Creada con ID:", newOrder.id);

    // Logs y Revalidación
    await createLog(tenant.id, "CREATE_ORDER", "WorkOrder", newOrder.id, `Orden #${newOrder.number} - ${plate}`);

    revalidatePath(`/${tenant.slug}/dashboard`);
    revalidatePath(`/${tenant.slug}/orders`);

  } catch (error) {
    console.error("🔥 Error Fatal en createOrder:", error);
    return { success: false, error: "Error interno del servidor" };
  }

  // Redirección fuera del try-catch (Next.js lo requiere así)
  // OJO: Usamos slug del formulario o lo volvemos a buscar, 
  // pero para asegurar usaremos el tenant que ya tenemos autenticado.
  const tenant = await getAuthenticatedTenant(); 
  redirect(`/${tenant.slug}/orders`);
}