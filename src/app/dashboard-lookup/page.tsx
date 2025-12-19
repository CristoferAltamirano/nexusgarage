import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLookupPage() {
    // 1. Verificamos quién está entrando
    const user = await currentUser();

    if (!user) return redirect("/");

    // 2. Buscamos en la BD cuál es su taller
    const tenant = await db.tenant.findFirst({
        where: { userId: user.id }
    });

    // 3. Si tiene taller, lo enviamos directo al Dashboard
    if (tenant) {
        redirect(`/${tenant.slug}/dashboard`);
    }

    // 4. Si NO tiene taller (raro, pero posible), lo mandamos al inicio
    redirect("/");
}