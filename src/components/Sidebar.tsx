"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CarFront, 
  FileText, 
  Package, 
  Settings, 
  Wrench,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";

interface SidebarProps {
  slug: string;
}

export function Sidebar({ slug }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `/${slug}/dashboard`,
      active: pathname === `/${slug}/dashboard`,
    },
    {
      label: "Clientes",
      icon: Users,
      href: `/${slug}/customers`,
      active: pathname.includes(`/${slug}/customers`),
    },
    {
      label: "Vehículos",
      icon: CarFront,
      href: `/${slug}/vehicles`,
      active: pathname.includes(`/${slug}/vehicles`),
    },
    {
      label: "Órdenes",
      icon: FileText,
      href: `/${slug}/orders`,
      active: pathname.includes(`/${slug}/orders`),
    },
    {
      label: "Inventario",
      icon: Package,
      href: `/${slug}/settings/catalog`,
      active: pathname.includes(`/${slug}/settings/catalog`),
    },
    {
      label: "Configuración",
      icon: Settings,
      href: `/${slug}/settings`,
      active: pathname === `/${slug}/settings`,
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-slate-950 border-r border-slate-800 text-slate-300">
      
      {/* 1. LOGO INDUSTRIAL */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/50 border border-orange-500">
          <Wrench className="h-6 w-6 text-slate-950" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white uppercase italic">
            Nexus
          </h1>
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest -mt-1">
            Garage OS
          </p>
        </div>
      </div>

      {/* 2. MENÚ DE NAVEGACIÓN */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        
        <div className="px-3 mb-2">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Operaciones
          </p>
        </div>

        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-3 text-sm font-medium transition-all duration-200",
              route.active 
                ? "bg-orange-600 text-white shadow-md shadow-orange-900/20 translate-x-1" 
                : "text-slate-400 hover:bg-slate-900 hover:text-white hover:translate-x-1"
            )}
          >
            <route.icon 
              className={cn(
                "mr-3 h-5 w-5 transition-colors", 
                route.active ? "text-white" : "text-slate-500 group-hover:text-orange-500"
              )} 
            />
            {route.label}
          </Link>
        ))}

      </div>

      {/* 3. FOOTER / SALIR */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
         <SignOutButton>
            <button className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 border border-slate-800 px-4 py-2 text-sm font-bold text-slate-400 hover:bg-red-950/30 hover:text-red-500 hover:border-red-900/50 transition-all uppercase tracking-wide">
               <LogOut className="h-4 w-4" />
               Cerrar Turno
            </button>
         </SignOutButton>
         <div className="mt-4 flex justify-center">
            {/* Pequeño detalle técnico visual */}
            <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]"></div>
            </div>
         </div>
      </div>
    </div>
  );
}