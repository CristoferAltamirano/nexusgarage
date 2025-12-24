'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { orderSchema } from "@/lib/schemas";
import { createLog } from "@/lib/create-log";

export async function createOrder(formData: FormData) {
  try {
    // 1. OBTENER USUARIO
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado");

    // 2. OBTENER EL TALLER CORRECTO (Desde el Formulario, NO adivinando)
    const formTenantId = formData.get("tenantId") as string;
    
    // 🔒 SEGURIDAD CRÍTICA:
    // Verificamos: ¿Existe este taller Y este usuario es su dueño?
    const tenant = await db.tenant.findUnique({
        where: {
            id: formTenantId,
            userId: userId 
        }
    });

    if (!tenant) throw new Error("Taller no encontrado o no autorizado");

    // 3. CONVERSIÓN DE DATOS
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
      kilometer: Number(formData.get("kilometer") || 0), 
      fuelLevel: Number(formData.get("fuelLevel") || 0),
    };

    const result = orderSchema.safeParse(rawData);

    if (!result.success) {
      console.error("❌ Error de Validación:", result.error.flatten());
      return { success: false, error: "Datos inválidos" };
    }

    const { firstName, lastName, taxId, email, phone, plate, brand, model, description, kilometer, fuelLevel } = result.data;

    // 4. LÓGICA DE BASE DE DATOS (Usando el tenant.id verificado)

    // Buscar/Crear Cliente en ESTE taller específico
    let customer = await db.customer.findFirst({
      where: { tenantId: tenant.id, taxId: taxId || "undefined" }
    });

    if (!customer) {
      customer = await db.customer.create({
          data: { tenantId: tenant.id, firstName, lastName, taxId, email, phone, address: "" }
      });
    }

    // Buscar/Crear Vehículo en ESTE taller específico
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

    console.log(`✅ Orden #${newOrder.number} creada correctamente en: ${tenant.name}`);

    // Logs y Revalidación
    await createLog(tenant.id, "CREATE_ORDER", "WorkOrder", newOrder.id, `Orden #${newOrder.number} - ${plate}`);

    // Revalidamos solo la ruta del taller actual
    revalidatePath(`/${tenant.slug}/dashboard`);
    revalidatePath(`/${tenant.slug}/orders`);
    
    return { success: true };

  } catch (error) {
    console.error("🔥 Error en createOrder:", error);
    return { success: false, error: "Error interno al crear la orden" };
  }
}