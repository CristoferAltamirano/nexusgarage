import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowRight, 
  Wrench, 
  ShieldCheck, 
  Settings, // Para el engranaje
  Cog,      // Otro engranaje
  Gauge,    // Medidor
  Hammer    // Martillo
} from "lucide-react"; 

// Acción de servidor
async function createTenantAction(formData: FormData) {
  "use server";
  const user = await currentUser();
  if (!user) return;

  const name = formData.get("companyName") as string;
  if (!name) return;

  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  await db.tenant.create({
    data: {
      name,
      slug,
      userId: user.id,
      email: user.emailAddresses[0].emailAddress,
    },
  });

  redirect(`/${slug}/dashboard`);
}

export default async function LandingPage() {
  const user = await currentUser();
  let existingTenant = null;

  if (user) {
    existingTenant = await db.tenant.findFirst({
      where: { userId: user.id },
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden">
      
      {/* 1. CINTA DE PELIGRO (Hazard Tape) SUPERIOR */}
      <div className="h-3 w-full" style={{
        backgroundImage: "repeating-linear-gradient(45deg, #000, #000 10px, #eab308 10px, #eab308 20px)"
      }}></div>

      {/* 2. ENGRANAJES DE FONDO (ANIMADOS) */}
      {/* Engranaje Gigante Superior Derecho */}
      <div className="absolute -top-20 -right-20 opacity-10 pointer-events-none">
        <Settings className="h-96 w-96 text-slate-500 animate-[spin_20s_linear_infinite]" />
      </div>
      {/* Engranaje Inferior Izquierdo (Gira al revés) */}
      <div className="absolute top-40 -left-20 opacity-5 pointer-events-none">
        <Cog className="h-[500px] w-[500px] text-slate-400 animate-[spin_30s_linear_infinite_reverse]" />
      </div>

      {/* EFECTO DE FONDO: Textura de piso metálico (Puntos) */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none"></div>
      
      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10 border-b border-white/5 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2 font-black text-xl tracking-tight text-white uppercase italic">
          <div className="h-10 w-10 rounded-sm bg-orange-600 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] border-2 border-orange-400">
            <Wrench className="h-6 w-6 text-black fill-current" />
          </div>
          <span className="text-slate-100">Nexus<span className="text-orange-500">Garage</span></span>
        </div>

        <nav>
          {existingTenant ? (
            <Link href={`/${existingTenant.slug}/dashboard`}>
                <Button className="bg-slate-200 text-slate-900 hover:bg-white font-bold border-b-4 border-slate-400 active:border-b-0 active:translate-y-1 transition-all">
                  Ir al Taller <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          ) : (
            <Link href="/sign-in">
               <Button variant="ghost" className="text-slate-400 hover:text-orange-400 hover:bg-slate-800 font-bold uppercase tracking-wider">
                 Ingresar
               </Button>
            </Link>
          )}
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        
        {/* Badge estilo "Etiqueta de Aceite" */}
        <div className="inline-flex items-center rounded border border-orange-500/50 bg-orange-950/30 px-4 py-1.5 text-sm font-bold text-orange-400 mb-8 backdrop-blur-sm uppercase tracking-widest shadow-lg">
          <Gauge className="mr-2 h-4 w-4" /> Potencia tu Negocio
        </div>

        {/* Título Principal Estilo Industrial */}
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter max-w-5xl leading-[0.9] mb-8 text-white drop-shadow-xl uppercase">
          Tu Taller <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-700" style={{WebkitTextStroke: "1px rgba(255,255,255,0.1)"}}>
            A Toda Máquina
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mb-12 font-medium leading-relaxed">
          El software hecho para manos con grasa. <br/>
          Controla <span className="text-white border-b-2 border-orange-500">autos</span>, <span className="text-white border-b-2 border-orange-500">repuestos</span> y <span className="text-white border-b-2 border-orange-500">dinero</span> sin complicaciones.
        </p>

        {/* LÓGICA DE BOTONES / FORMULARIO */}
        <div className="w-full max-w-md space-y-4">
          
          {!user ? (
             <Link href="/sign-up">
                <Button size="lg" className="w-full h-16 text-xl bg-orange-600 hover:bg-orange-500 text-white shadow-[0px_0px_20px_rgba(234,88,12,0.4)] border-2 border-orange-400 font-black uppercase tracking-wide transition-transform hover:scale-[1.02] skew-x-[-3deg]">
                    <Hammer className="mr-2 h-6 w-6 fill-current" /> Arrancar Gratis
                </Button>
             </Link>
          ) : existingTenant ? (
             <div className="flex flex-col gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <Link href={`/${existingTenant.slug}/dashboard`}>
                    <Button size="lg" className="w-full h-16 text-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl border-b-4 border-emerald-800 font-black uppercase active:border-b-0 active:translate-y-1">
                        ABRIR {existingTenant.name}
                    </Button>
                </Link>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-mono bg-black/20 py-1 rounded">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    MECÁNICO EN LINEA: {user.firstName?.toUpperCase()}
                </div>
             </div>
          ) : (
            /* FORMULARIO ESTILO "CAJA DE HERRAMIENTAS" */
            <form action={createTenantAction} className="flex flex-col gap-5 bg-gradient-to-b from-slate-800 to-slate-900 p-8 rounded-xl border-t-4 border-t-slate-600 border-b-4 border-b-slate-950 shadow-2xl relative">
                {/* Tornillos decorativos en las esquinas */}
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-500 shadow-inner"></div>
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-500 shadow-inner"></div>
                <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-500 shadow-inner"></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-500 shadow-inner"></div>

                <div className="space-y-2 text-left">
                    <label className="text-xs font-black text-orange-500 uppercase tracking-widest">Nombre del Taller</label>
                    <Input 
                        name="companyName" 
                        placeholder="EJ: MECÁNICA TURBO" 
                        className="bg-slate-950 border-2 border-slate-700 text-white placeholder:text-slate-600 h-14 text-lg font-bold uppercase focus:border-orange-500 focus:ring-0 transition-all rounded-md"
                        required 
                    />
                </div>
                <Button type="submit" size="lg" className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-wider border-2 border-orange-800 hover:border-orange-400">
                    Crear Taller
                </Button>
            </form>
          )}
        </div>

        {/* FOOTER PEQUEÑO */}
        <div className="mt-20 flex flex-col md:flex-row items-center gap-8 text-sm text-slate-600 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-slate-500" /> Datos Encriptados</span>
            <span className="hidden md:block w-px h-4 bg-slate-800"></span>
            <span>Sin Tarjetas • Sin Letra Chica</span>
        </div>
      </main>
    </div>
  );
}