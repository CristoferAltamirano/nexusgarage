'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createItem(formData: FormData) {
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const quantity = parseInt(formData.get("quantity") as string);
  const workOrderId = formData.get("workOrderId") as string;
  const slug = formData.get("slug") as string;

  if (!description || !price || !workOrderId) return;

  // 1. Crear el ítem
  await db.orderItem.create({
    data: {
      description,
      price,
      quantity,
      workOrderId,
    },
  });

  // 2. Actualizar la pantalla
  revalidatePath(`/${slug}/orders/${workOrderId}`);
}