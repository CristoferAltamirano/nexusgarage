'use server'

import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function registerTenant(formData: FormData) {
  const { userId } = await auth();
  const name = formData.get("name") as string;

  // 1. EL CAMBIO ESTÁ AQUÍ:
  // Si no hay usuario, lo mandamos a login PERO guardamos el nombre en la URL de regreso
  if (!userId) {
     const encodedName = encodeURIComponent(name); // Protegemos el texto (espacios, tildes)
     // Le decimos: "Vuelve a la portada, pero con el parametro ?pending_tenant=Nombre"
     return (await auth()).redirectToSignIn({ 
         returnBackUrl: `/?pending_tenant=${encodedName}` 
     });
  }

  // 2. Si ya hay usuario, seguimos normal
  const user = await currentUser();
  if (!name || !user) return;

  const slug = name
    .toLowerCase()
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const existing = await db.tenant.findUnique({ where: { slug } });
  
  let finalSlug = slug;
  if (existing) {
    finalSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;
  }

  await db.tenant.create({
    data: { 
        name, 
        slug: finalSlug,
        userId: user.id 
    }
  });

  redirect(`/${finalSlug}/dashboard`);
}