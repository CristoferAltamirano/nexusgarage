"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wrench, 
  Package, 
  Settings,
  LogOut 
} from "lucide-react";

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
      href: `/${slug}/customers`, // Asegúrate de tener esta ruta
      active: pathname.includes("/customers"),
    },
    {
      label: "Vehículos",
      icon: Car,
      href: `/${slug}/vehicles`,
      active: pathname.includes("/vehicles"),
    },
    {
      label: "Órdenes",
      icon: Wrench,
      href: `/${slug}/orders`,
      active: pathname.includes("/orders"),
    },
    {
      label: "Inventario",
      icon: Package,
      href: `/${slug}/settings/catalog`, // La ruta nueva de inventario
      active: pathname.includes("/settings/catalog"),
    },
    {
      label: "Configuración",
      icon: Settings,
      href: `/${slug}/settings`,
      active: pathname === `/${slug}/settings`,
    },
  ];

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white w-64 border-r border-slate-800">
      <div className="px-6 py-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Nexus CRM
        </h1>
      </div>
      <div className="flex-1 px-3 py-2 space-y-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
              route.active ? "text-white bg-white/10" : "text-zinc-400"
            )}
          >
            <div className="flex items-center flex-1">
              <route.icon className={cn("h-5 w-5 mr-3", route.active ? "text-indigo-400" : "text-zinc-400")} />
              {route.label}
            </div>
          </Link>
        ))}
      </div>
      <div className="px-3 py-2">
          <Link href="/" className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-red-400 hover:bg-red-500/10 rounded-lg transition text-zinc-400">
             <div className="flex items-center flex-1">
                <LogOut className="h-5 w-5 mr-3" />
                Salir
             </div>
          </Link>
      </div>
    </div>
  );
}