'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthenticatedTenant } from "@/lib/safe-action";
import { productSchema } from "@/lib/schemas"; // Asegúrate de tener esto en schemas.ts
import { createLog } from "@/lib/create-log";

// 1. Crear un Producto
export async function createProduct(formData: FormData) {
  const tenant = await getAuthenticatedTenant();

  const rawData = {
    name: formData.get("name"),
    category: formData.get("category"),
    price: parseFloat(formData.get("price") as string),
    stock: parseInt(formData.get("stock") as string) || 0,
    code: formData.get("code") || "",
  };

  const result = productSchema.safeParse(rawData);

  if (!result.success) {
    console.error("Error validación:", result.error.flatten());
    return;
  }

  const newProduct = await db.serviceProduct.create({
    data: {
        tenantId: tenant.id,
        name: result.data.name,
        category: result.data.category,
        netPrice: result.data.price,
        stock: result.data.stock,
        code: formData.get("code") as string
    }
  });

  await createLog(
    tenant.id, 
    "CREATE_PRODUCT", 
    "ServiceProduct", 
    newProduct.id, 
    `Creado: ${newProduct.name}`
  );

  revalidatePath(`/${tenant.slug}/settings/catalog`);
}

// 2. Borrar Producto (SOFT DELETE ♻️)
export async function deleteProduct(productId: string, slug: string) {
    const tenant = await getAuthenticatedTenant();

    const product = await db.serviceProduct.findFirst({
        where: { id: productId, tenantId: tenant.id }
    });

    if (!product) return;

    // EN LUGAR DE BORRAR, MARCAMOS COMO BORRADO
    await db.serviceProduct.update({
        where: { id: productId },
        data: { deletedAt: new Date() }
    });

    await createLog(
        tenant.id, 
        "DELETE_PRODUCT", 
        "ServiceProduct", 
        productId, 
        `Papelera: ${product.name}`
    );

    revalidatePath(`/${slug}/settings/catalog`);
}