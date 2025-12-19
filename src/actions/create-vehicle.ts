'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createVehicle(formData: FormData) {
  const tenantId = formData.get("tenantId") as string;
  const slug = formData.get("slug") as string;
  const customerId = formData.get("customerId") as string;
  
  const brand = formData.get("brand") as string;
  const model = formData.get("model") as string;
  const plateOrSerial = formData.get("plateOrSerial") as string; // Patente
  const type = formData.get("type") as string; // Auto, Moto, Camioneta
  const color = formData.get("color") as string;

  if (!tenantId || !customerId || !brand || !plateOrSerial) {
    return;
  }

  // Guardamos en DB
  await db.vehicle.create({
    data: {
      tenantId,
      customerId,
      brand,
      model,
      plateOrSerial: plateOrSerial.toUpperCase().replace(/\s/g, ""), // Limpiamos patente
      type,
      color,
    },
  });

  revalidatePath(`/${slug}/vehicles`);
}