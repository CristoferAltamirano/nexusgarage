'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createLog } from "@/lib/create-log";

export async function createProduct(formData: FormData) {
  try {
    // 1. Obtener usuario autenticado
    const { userId } = await auth();
    if (!userId) return { success: false, error: "No autorizado" };

    // 2. Obtener datos de seguridad del formulario
    const tenantId = formData.get("tenantId") as string;
    const slug = formData.get("slug") as string;

    // 3. 🚨 SEGURIDAD CRÍTICA:
    // Verificamos que el usuario sea dueño del taller
    const tenant = await db.tenant.findUnique({
      where: {
        id: tenantId,
        userId: userId 
      }
    });

    if (!tenant) {
        return { success: false, error: "No tienes permiso en este taller" };
    }

    // 4. Captura de datos
    const name = formData.get("name") as string;
    
    // Capturamos el código (o sku)
    let code = (formData.get("sku") as string) || (formData.get("code") as string);
    
    const category = formData.get("category") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const stock = parseInt(formData.get("stock") as string) || 0;

    // Validación básica
    if (!name) return { success: false, error: "El nombre es obligatorio" };

    // Si no puso código, generamos uno automático
    if (!code) {
      code = `SKU-${Date.now()}`; 
    }

    // 5. Guardar en la Base de Datos
    await db.serviceProduct.create({
      data: {
        tenantId: tenant.id, // Usamos el ID verificado
        name,
        code,
        category,
        netPrice: price,
        stock,
        // ❌ ELIMINAMOS 'description' PORQUE NO EXISTE EN TU BASE DE DATOS
      },
    });

    // 6. Generar Log
    await createLog(tenant.id, "CREATE_PRODUCT", "Product", code, name);

    // 7. Actualizar la vista
    revalidatePath(`/${slug}/settings/catalog`);
    
    return { success: true };

  } catch (error) {
    console.error("Error creating product:", error);
    return { success: false, error: "Error interno al crear el producto" };
  }
}