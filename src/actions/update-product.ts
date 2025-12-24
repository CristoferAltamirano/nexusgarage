'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { createLog } from "@/lib/create-log";

export async function updateProduct(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autorizado");

  // 1. Recibir datos
  const productId = formData.get("id") as string;
  const tenantId = formData.get("tenantId") as string;
  const slug = formData.get("slug") as string;
  
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const category = formData.get("category") as string;
  const price = parseFloat(formData.get("price") as string) || 0;
  const stock = parseInt(formData.get("stock") as string) || 0;

  // 2. Verificar Seguridad (Que el usuario sea dueño del taller)
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId, userId },
  });

  if (!tenant) throw new Error("No tienes permisos en este taller");

  // 3. Actualizar en Base de Datos
  // Nota: Aseguramos que el 'id' y el 'tenantId' coincidan para no editar productos de otro taller por error
  await db.serviceProduct.update({
    where: { 
        id: productId,
        tenantId: tenantId 
    },
    data: {
      name,
      code,
      category,
      netPrice: price,
      stock,
      // description: no lo ponemos porque no existe en tu schema
    }
  });

  // 4. Log y Revalidación
  await createLog(tenantId, "UPDATE_PRODUCT", "Product", productId, name);
  revalidatePath(`/${slug}/settings/catalog`);
  
  // No retornamos redirect aquí, lo manejamos en el cliente para mostrar el Toast
}