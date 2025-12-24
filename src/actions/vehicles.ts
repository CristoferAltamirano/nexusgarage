"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server"; // Usamos Clerk directamente para mayor control
import { createLog } from "@/lib/create-log";

/**
 * GUARDAR VEHÍCULO (CREAR O EDITAR)
 */
export async function saveVehicle(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const formTenantId = formData.get("tenantId")?.toString();
    if (!formTenantId) return { success: false, error: "Falta el ID del taller" };

    // 1. Validar permisos en el taller específico del formulario
    const tenant = await db.tenant.findFirst({
      where: {
        id: formTenantId,
        OR: [
            { userId: user.id },                 // Dueño
            { users: { some: { id: user.id } } } // Empleado
        ]
      }
    });

    if (!tenant) return { success: false, error: "No tienes permisos en este taller" };

    // 2. Extraer datos del formulario
    const id = formData.get("id")?.toString(); // Si viene ID, es edición
    const customerId = formData.get("customerId")?.toString();
    
    // Campos del vehículo
    const plateOrSerial = formData.get("plateOrSerial")?.toString().toUpperCase().trim();
    const brand = formData.get("brand")?.toString().trim();
    const model = formData.get("model")?.toString().trim();
    const type = formData.get("type")?.toString() || "CAR";
    const color = formData.get("color")?.toString();
    const notes = formData.get("notes")?.toString();

    // 3. Validaciones básicas
    if (!plateOrSerial || !brand || !model) {
      return { success: false, error: "Patente, marca y modelo son obligatorios" };
    }

    // 4. VALIDACIÓN CRÍTICA: Si es creación, necesitamos un Customer ID
    if (!id && !customerId) {
      return { success: false, error: "Error interno: No se ha asignado un cliente válido a este vehículo." };
    }

    await db.$transaction(async (tx) => {
      
      // 5. Verificar duplicados (Patente única por Tenant)
      const existing = await tx.vehicle.findFirst({
        where: { 
          plateOrSerial, 
          tenantId: tenant.id, // ✅ Usamos el tenant verificado
          // Si estamos editando, ignoramos nuestro propio ID
          NOT: id ? { id } : undefined,
          deletedAt: null // Solo activos
        }
      });

      if (existing) {
        throw new Error(`La patente ${plateOrSerial} ya existe en este taller.`);
      }

      if (id) {
        // --- MODO EDICIÓN ---
        // Verificamos que el vehículo pertenezca a este taller antes de editar
        const vehicleToEdit = await tx.vehicle.findUnique({
             where: { id }
        });
        
        if (!vehicleToEdit || vehicleToEdit.tenantId !== tenant.id) {
            throw new Error("Vehículo no encontrado o no pertenece a este taller");
        }

        await tx.vehicle.update({
          where: { id },
          data: {
            plateOrSerial,
            brand,
            model,
            type,
            color,
            notes,
          }
        });
        await createLog(tenant.id, "UPDATE_VEHICLE", "Vehicle", id, `Vehículo ${plateOrSerial} actualizado`);

      } else {
        // --- MODO CREACIÓN ---
        
        // Verificar que el cliente exista y sea de este taller
        const customerExists = await tx.customer.findFirst({
          where: { id: customerId, tenantId: tenant.id }
        });

        if (!customerExists) {
          throw new Error("El cliente seleccionado no existe o no pertenece a este taller.");
        }

        const newVehicle = await tx.vehicle.create({
          data: {
            tenantId: tenant.id,
            customerId: customerId!, 
            plateOrSerial: plateOrSerial!,
            brand: brand!,
            model: model!,
            type,
            color,
            notes,
          }
        });
        
        await createLog(tenant.id, "CREATE_VEHICLE", "Vehicle", newVehicle.id, `Vehículo ${plateOrSerial} creado`);
      }
    });

    // 6. Revalidar rutas para actualizar la UI
    revalidatePath(`/${tenant.slug}/vehicles`);
    revalidatePath(`/${tenant.slug}/customers`); // También actualizamos la lista de clientes (contador de autos)
    
    if (customerId) {
        revalidatePath(`/${tenant.slug}/customers/${customerId}`);
    }
    
    return { success: true };

  } catch (error: any) {
    console.error("[SAVE_VEHICLE_ERROR]", error);
    return { success: false, error: error.message || "Error al guardar el vehículo" };
  }
}

/**
 * ELIMINAR VEHÍCULO (SOFT DELETE)
 */
export async function deleteVehicle(vehicleId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    // 1. Buscar el vehículo para saber su Tenant
    const vehicle = await db.vehicle.findUnique({
        where: { id: vehicleId }
    });

    if (!vehicle) return { success: false, error: "Vehículo no encontrado" };

    // 2. Validar permisos en ESE tenant
    const tenant = await db.tenant.findFirst({
        where: {
            id: vehicle.tenantId,
            OR: [
                { userId: user.id },                 // Dueño
                { users: { some: { id: user.id } } } // Empleado
            ]
        }
    });

    if (!tenant) return { success: false, error: "No tienes permiso para eliminar este vehículo" };

    await db.$transaction(async (tx) => {
      // Soft delete
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { deletedAt: new Date() }
      });

      await createLog(tenant.id, "DELETE_VEHICLE", "Vehicle", vehicleId, `Vehículo ${vehicle.plateOrSerial} eliminado`);
    });

    revalidatePath(`/${tenant.slug}/vehicles`);
    revalidatePath(`/${tenant.slug}/customers`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}