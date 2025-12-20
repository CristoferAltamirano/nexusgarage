'use server'

import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export async function createTenant(formData: FormData) {
  const name = formData.get("name") as string;
  const user = await currentUser();

  // Si no hay usuario o nombre, detenemos la ejecución
  if (!name || !user) return;

  // 1. Generar Slug Base (Tu lógica de normalización está excelente)
  let slug = name
    .toLowerCase()
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quita acentos
    .replace(/[^a-z0-9]+/g, "-") // Reemplaza símbolos por guiones
    .replace(/^-+|-+$/g, ""); // Quita guiones al inicio/final

  try {
    // 2. Verificar existencia previa (Blindaje Nivel 1)
    const existing = await db.tenant.findUnique({ where: { slug } });
    
    if (existing) {
      // Si existe, agregamos 4 dígitos aleatorios (ej: taller-nitro-4821)
      // Usamos 1000+ para asegurar 4 dígitos siempre
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // 3. Intentar crear el taller
    await db.tenant.create({
      data: { 
        name, 
        slug,
        userId: user.id 
      }
    });

  } catch (error: any) {
    // 4. Blindaje Nivel 2: Capturar error P2002 (Unique constraint failed)
    // Esto ocurre si, por mala suerte, el número aleatorio también estaba ocupado
    if (error.code === 'P2002') {
      console.log("Slug duplicado encontrado, intentando con timestamp...");
      // Solución definitiva: Usar la fecha exacta (timestamp) que es irrepetible
      slug = `${slug}-${Date.now()}`;
      
      await db.tenant.create({
        data: { name, slug, userId: user.id }
      });
    } else {
      // Si es otro error (conexión, etc), lo lanzamos para verlo en los logs
      console.error("Error fatal creando tenant:", error);
      throw error;
    }
  }

  // 5. Redirección (IMPORTANTE: Debe ir fuera del try/catch)
  // Si la pones adentro, el 'catch' capturaría la redirección como si fuera un error.
  redirect(`/${slug}/dashboard`);
}