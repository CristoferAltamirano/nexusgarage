'use server'

import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server"; // <--- 1. Importamos el usuario

export async function createTenant(formData: FormData) {
  const name = formData.get("name") as string;
  
  // 2. Obtenemos el usuario actual
  const user = await currentUser();

  // Si no hay usuario logueado, cancelamos
  if (!name || !user) return;

  // Generar Slug
  const slug = name
    .toLowerCase()
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Verificar si existe
  const existing = await db.tenant.findUnique({ where: { slug } });
  
  let finalSlug = slug;
  if (existing) {
    finalSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }

  // 3. Crear el taller AGREGANDO el userId (Esto arregla el error)
  await db.tenant.create({
    data: { 
        name, 
        slug: finalSlug,
        userId: user.id // <--- ¡AQUÍ ESTÁ LA SOLUCIÓN!
    }
  });

  redirect(`/${finalSlug}/dashboard`);
}