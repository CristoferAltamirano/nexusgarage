import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar"; 
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar"; 
import { currentUser } from "@clerk/nextjs/server"; 
import { UserButton } from "@clerk/nextjs"; 
import { ShieldAlert } from "lucide-react";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await currentUser();

  if (!user) redirect("/");

  const tenant = await db.tenant.findUnique({
    where: { slug },
  });

  if (!tenant) redirect("/");

  // SEGURIDAD: Verificar propiedad del taller
  if (tenant.userId !== user.id) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-slate-950 text-slate-200">
            <div className="bg-slate-900 p-8 rounded-xl shadow-2xl border border-slate-800 text-center max-w-md">
                <div className="mx-auto h-16 w-16 bg-red-900/30 rounded-full flex items-center justify-center mb-4 border border-red-900/50">
                    <ShieldAlert className="h-8 w-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Acceso Denegado</h1>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    No tienes permisos para administrar el taller <strong className="text-white">{tenant.name}</strong>.
                </p>
                <a 
                    href="/" 
                    className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-orange-600 px-8 text-sm font-bold text-white shadow-lg shadow-orange-900/20 transition-all hover:bg-orange-700 uppercase tracking-wide"
                >
                    Volver al Inicio
                </a>
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 relative selection:bg-orange-500/30">
      
      {/* BARRA LATERAL (PC) */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-50 bg-slate-950 border-r border-slate-800 shadow-xl">
        <Sidebar slug={slug} />
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300 h-full relative">
        
        {/* ========================================================= */}
        {/* FONDO LIMPIO: PUNTOS SUTILES (DOT PATTERN) */}
        {/* Mucho más suave a la vista que la cuadrícula completa */}
        {/* ========================================================= */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none z-0"></div>
        
        {/* HEADER SUPERIOR */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 md:px-6 shadow-sm print:hidden sticky top-0 z-40">
          
          <div className="md:hidden mr-2">
             <MobileSidebar slug={slug} />
          </div>

          <div className="flex-1">
             <GlobalSearch tenantId={tenant.id} slug={slug} />
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">
                    {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] font-bold text-orange-600 uppercase mt-1 tracking-wide bg-orange-50 px-2 py-0.5 rounded inline-block border border-orange-100">
                    {tenant.name}
                </p>
             </div>
             
             <UserButton afterSignOutUrl="/" /> 
          </div>
        </header>

        {/* CONTENIDO DE LA PÁGINA */}
        <main className="flex-1 overflow-y-auto p-0 scroll-smooth relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}