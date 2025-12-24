"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { createLog } from "@/lib/create-log";

/**
 * 1. CREAR PRODUCTO / SERVICIO
 */
export async function createProduct(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const formTenantId = formData.get("tenantId")?.toString();
    if (!formTenantId) return { success: false, error: "Falta el ID del taller" };

    // ✅ VALIDACIÓN DE SEGURIDAD POR CONTEXTO
    // Verificamos permisos en el taller específico del formulario
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

    // Datos del formulario
    const name = formData.get("name")?.toString().trim();
    const category = formData.get("category")?.toString() || "Repuesto";
    const netPrice = parseFloat(formData.get("netPrice")?.toString() || "0");
    const stock = parseInt(formData.get("stock")?.toString() || "0");
    const slug = formData.get("slug")?.toString();
    
    // Generación automática de código si viene vacío
    let code = formData.get("code")?.toString().trim();
    if (!code) {
        code = `SKU-${Date.now()}`;
    }

    if (!name) return { success: false, error: "El nombre es obligatorio" };

    const product = await db.$transaction(async (tx) => {
        // Verificar duplicados (Nombre o Código) en ESTE taller específico
        const existing = await tx.serviceProduct.findFirst({
            where: {
                tenantId: tenant.id,
                deletedAt: null,
                OR: [
                    { name: { equals: name, mode: "insensitive" } },
                    { code: { equals: code, mode: "insensitive" } }
                ]
            }
        });

        if (existing) {
            throw new Error(`Ya existe un ítem con ese nombre o código en este taller.`);
        }

        // Crear
        const newItem = await tx.serviceProduct.create({
            data: {
                tenantId: tenant.id,
                name,
                category,
                netPrice,
                stock: category === "Mano de Obra" ? 999999 : stock, // Stock visual infinito para servicios
                code: code! 
            }
        });

        await createLog(tenant.id, "CREATE_PRODUCT", "Inventory", newItem.id, `Creado: ${newItem.name}`);
        
        return newItem;
    });

    if (slug) {
        revalidatePath(`/${slug}/settings/catalog`);
        revalidatePath(`/${slug}/inventory`);
    }
    
    return { success: true, id: product.id };

  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message };
  }
}

/**
 * 2. ACTUALIZAR PRODUCTO
 */
export async function updateProduct(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    const formTenantId = formData.get("tenantId")?.toString();
    if (!formTenantId) return { success: false, error: "Falta el ID del taller" };

    // Validar permisos en el taller específico
    const tenant = await db.tenant.findFirst({
      where: {
        id: formTenantId,
        OR: [
            { userId: user.id },
            { users: { some: { id: user.id } } }
        ]
      }
    });

    if (!tenant) return { success: false, error: "No tienes permisos en este taller" };

    const id = formData.get("id")?.toString();
    const name = formData.get("name")?.toString().trim();
    const category = formData.get("category")?.toString();
    const netPrice = parseFloat(formData.get("netPrice")?.toString() || "0");
    const stock = parseInt(formData.get("stock")?.toString() || "0");
    const code = formData.get("code")?.toString().trim();
    const slug = formData.get("slug")?.toString();

    if (!id || !name) return { success: false, error: "Datos incompletos" };

    await db.$transaction(async (tx) => {
        // Verificar que el producto sea de este taller
        const currentProduct = await tx.serviceProduct.findFirst({
            where: { id, tenantId: tenant.id }
        });

        if (!currentProduct) throw new Error("Producto no encontrado en este taller");

        await tx.serviceProduct.update({
            where: { id },
            data: {
                name,
                category,
                netPrice,
                stock: category === "Mano de Obra" ? 999999 : stock,
                code: code || currentProduct.code
            }
        });

        await createLog(tenant.id, "UPDATE_PRODUCT", "Inventory", id, `Actualizado: ${name}`);
    });

    if (slug) {
        revalidatePath(`/${slug}/settings/catalog`);
        revalidatePath(`/${slug}/inventory`);
    }

    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 3. ELIMINAR PRODUCTO
 */
export async function deleteProduct(productId: string) {
  try {
    const user = await currentUser();
    if (!user) return { success: false, error: "No autorizado" };

    // 1. Buscar el producto para saber su Tenant
    const product = await db.serviceProduct.findUnique({
        where: { id: productId }
    });

    if (!product) return { success: false, error: "Ítem no encontrado" };

    // 2. Validar permisos en ESE tenant
    const tenant = await db.tenant.findFirst({
        where: {
            id: product.tenantId,
            OR: [
                { userId: user.id },
                { users: { some: { id: user.id } } }
            ]
        }
    });

    if (!tenant) return { success: false, error: "No tienes permiso para eliminar este ítem" };

    await db.$transaction(async (tx) => {
      // Soft Delete
      await tx.serviceProduct.update({
        where: { id: productId },
        data: { deletedAt: new Date() }
      });

      await createLog(tenant.id, "DELETE_PRODUCT", "Inventory", productId, `Eliminado: ${product.name}`);
    });

    revalidatePath(`/${tenant.slug}/settings/catalog`);
    revalidatePath(`/${tenant.slug}/inventory`);
    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}