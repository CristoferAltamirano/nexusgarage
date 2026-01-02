"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { createLog } from "@/lib/create-log";

/**
 * GUARDAR CLIENTE (CREAR O ACTUALIZAR)
 * Ahora soporta 'country' para la localización internacional.
 */
export async function createCustomer(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const formTenantId = formData.get("tenantId")?.toString();
    if (!formTenantId) return { success: false, error: "Falta el ID del taller" };

    // ✅ VERIFICACIÓN DE SEGURIDAD: Dueño o Miembro del equipo
    const tenant = await db.tenant.findFirst({
      where: {
        id: formTenantId,
        OR: [
            { userId: user.id },                 // Es el Dueño
            { users: { some: { id: user.id } } } // Es Miembro del equipo
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
    
    // 🔥 AQUÍ ESTÁ LA MAGIA DE LA INTERNACIONALIZACIÓN
    // 'taxId' viene del formulario dinámico (RUT, DNI, etc.)
    const taxId = formData.get("taxId")?.toString() || ""; 
    // 'country' viene del selector de país (CL, AR, MX...)
    const country = formData.get("country")?.toString() || "CL"; // Default Chile si falla

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
        taxId,    // Guardamos el documento
        country,  // ✅ Guardamos el país de origen
        email,
        phone,
        address
      };

      let res;

      if (customerId) {
        // MODO ACTUALIZAR
        res = await tx.customer.update({
          where: { id: customerId },
          data: dataToSave
        });
        await createLog(tenant.id, "UPDATE_CUSTOMER", "Customer", res.id, `Actualizado: ${res.firstName}`);
      } else {
        // MODO CREAR
        res = await tx.customer.create({
          data: dataToSave
        });
        await createLog(tenant.id, "CREATE_CUSTOMER", "Customer", res.id, `Creado: ${res.firstName}`);
      }

      return res;
    });

    // REVALIDACIÓN DE RUTAS
    revalidatePath(`/${tenant.slug}/customers`);
    
    if (customerId) {
        revalidatePath(`/${tenant.slug}/customers/${customerId}`);
    }

    return { success: true, id: customer.id };
  } catch (error: any) {
    console.error("Error createCustomer:", error);
    // Manejo de error de unicidad (ej: RUT repetido)
    if (error.code === 'P2002') {
        return { success: false, error: "Ya existe un cliente con ese Documento/RUT en este taller." };
    }
    return { success: false, error: error.message || "Error al guardar" };
  }
}

/**
 * ELIMINAR CLIENTE (SOFT DELETE)
 */
export async function deleteCustomer(customerId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const customer = await db.customer.findUnique({
        where: { id: customerId }
    });

    if (!customer) return { success: false, error: "Cliente no encontrado" };

    // Verificar permisos
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
      // Marcar cliente como eliminado
      await tx.customer.update({
        where: { id: customerId },
        data: { deletedAt: new Date() }
      });

      // Marcar sus vehículos como eliminados también (Cascada lógica)
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