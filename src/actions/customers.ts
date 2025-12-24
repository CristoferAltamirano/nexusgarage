"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { createLog } from "@/lib/create-log";

/**
 * GUARDAR CLIENTE (CREAR O ACTUALIZAR)
 */
export async function saveCustomer(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const formTenantId = formData.get("tenantId")?.toString();
    if (!formTenantId) return { success: false, error: "Falta el ID del taller" };

    // ✅ CORRECCIÓN DE SEGURIDAD:
    // Ahora preguntamos: "¿Es el ID del taller correcto? Y ADEMÁS:
    // ¿Es el usuario el DUEÑO (userId) O es parte del equipo (users)?"
    const tenant = await db.tenant.findFirst({
      where: {
        id: formTenantId,
        OR: [
            { userId: user.id },                 // 1. Es el Dueño directo
            { users: { some: { id: user.id } } } // 2. O es un Miembro del equipo
        ]
      }
    });

    if (!tenant) {
      return { success: false, error: "No tienes permisos en este taller." };
    }
    
    // --- DATOS DEL FORMULARIO ---
    const customerId = formData.get("id")?.toString();
    const isCompany = formData.get("isCompany") === "on";
    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString() || "";
    const taxId = formData.get("taxId")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const address = formData.get("address")?.toString() || "";

    if (!firstName) {
      return { success: false, error: "El nombre es obligatorio" };
    }

    // TRANSACCIÓN
    const customer = await db.$transaction(async (tx) => {
      const dataToSave = {
        tenantId: tenant.id,
        firstName,
        lastName: isCompany ? "" : lastName,
        isCompany,
        taxId,
        email,
        phone,
        address
      };

      let res;

      if (customerId) {
        // ACTUALIZAR
        res = await tx.customer.update({
          where: { id: customerId },
          data: dataToSave
        });
        await createLog(tenant.id, "UPDATE_CUSTOMER", "Customer", res.id, `Actualizado: ${res.firstName}`);
      } else {
        // CREAR
        res = await tx.customer.create({
          data: dataToSave
        });
        await createLog(tenant.id, "CREATE_CUSTOMER", "Customer", res.id, `Creado: ${res.firstName}`);
      }

      return res;
    });

    revalidatePath(`/${tenant.slug}/customers`);
    
    if (customerId) {
        revalidatePath(`/${tenant.slug}/customers/${customerId}`);
    }

    return { success: true, id: customer.id };
  } catch (error: any) {
    console.error("Error saveCustomer:", error);
    return { success: false, error: error.message || "Error al guardar" };
  }
}

/**
 * ELIMINAR CLIENTE
 */
export async function deleteCustomer(customerId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const customer = await db.customer.findUnique({
        where: { id: customerId }
    });

    if (!customer) return { success: false, error: "Cliente no encontrado" };

    // ✅ MISMA CORRECCIÓN PARA ELIMINAR:
    // Verificar si es Dueño O Empleado del taller al que pertenece el cliente
    const tenant = await db.tenant.findFirst({
        where: {
            id: customer.tenantId,
            OR: [
                { userId: user.id },                 // Dueño
                { users: { some: { id: user.id } } } // Miembro
            ]
        }
    });

    if (!tenant) return { success: false, error: "No tienes permiso para eliminar este cliente" };

    await db.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id: customerId },
        data: { deletedAt: new Date() }
      });

      await tx.vehicle.updateMany({
        where: { customerId, tenantId: tenant.id },
        data: { deletedAt: new Date() }
      });

      await createLog(tenant.id, "DELETE_CUSTOMER", "Customer", customerId, `Eliminado: ${customer.firstName}`);
    });

    revalidatePath(`/${tenant.slug}/customers`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}