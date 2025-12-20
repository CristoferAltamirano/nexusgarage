import { CreateTenantForm } from "@/components/auth/create-tenant-form";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function SetupPage() {
  console.log("1. Iniciando SetupPage..."); // <--- LOG 1

  const user = await currentUser();
  console.log("2. Usuario obtenido:", user?.id); // <--- LOG 2

  if (!user) {
    console.log("3. No hay usuario, redirigiendo...");
    return redirect("/sign-in");
  }

  console.log("4. Buscando taller en DB...");
  const existingTenant = await db.tenant.findFirst({
    where: { userId: user.id }
  });
  console.log("5. Resultado DB:", existingTenant); // <--- LOG 3

  if (existingTenant) {
    return redirect(`/${existingTenant.slug}/dashboard`);
  }

  console.log("6. Renderizando formulario...");
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] bg-white p-8 rounded-xl border shadow-sm">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bienvenido a Nexus</h1>
          <p className="text-sm text-slate-500">
            Vamos a configurar tu espacio de trabajo.
          </p>
        </div>
        <CreateTenantForm />
      </div>
    </div>
  );
}