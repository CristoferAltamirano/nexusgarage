'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const tenantId = formData.get("tenantId") as string;
  const slug = formData.get("slug") as string;
  
  const name = formData.get("name") as string;
  // Capturamos el código. Si viene vacío, inventamos uno para cumplir con la DB.
  let code = formData.get("code") as string;
  
  const category = formData.get("category") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const stock = parseInt(formData.get("stock") as string) || 0;

  // Validación básica
  if (!name || !tenantId) return;

  // Si el usuario no puso código, generamos uno automático (Ej: SKU-123456789)
  if (!code) {
    code = `SKU-${Date.now()}`; 
  }

  // Guardamos en la Base de Datos
  await db.serviceProduct.create({
    data: {
      tenantId,
      name,
      code, // <--- Aquí estaba el error, ahora ya lo enviamos
      category,
      netPrice: price,
      stock,
    },
  });

  revalidatePath(`/${slug}/settings/catalog`);
}