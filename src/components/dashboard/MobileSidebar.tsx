"use client";

import { 
    Sheet, 
    SheetContent, 
    SheetTrigger, 
    SheetTitle,
    SheetDescription 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
    LayoutDashboard, 
    Users, 
    Car, 
    Wrench, 
    Settings, 
    Package 
} from "lucide-react";

const routes = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customers", label: "Clientes", icon: Users },
    { href: "/vehicles", label: "Vehículos", icon: Car },
    { href: "/orders", label: "Órdenes", icon: Wrench },
    { href: "/settings/catalog", label: "Inventario", icon: Package }, // Ruta correcta al catálogo
    { href: "/settings", label: "Configuración", icon: Settings },
];

export const MobileSidebar = ({ slug }: { slug: string }) => {
    const pathname = usePathname();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden pr-4 hover:bg-transparent">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-white w-72">
                
                {/* ENCABEZADO DEL MENÚ */}
                <div className="p-6 border-b border-slate-100">
                    <SheetTitle className="text-xl font-bold text-indigo-600">
                        Nexus CRM
                    </SheetTitle>
                    {/* Descripción oculta para cumplir normas de accesibilidad y eliminar warnings */}
                    <SheetDescription className="hidden">
                        Navegación principal para dispositivos móviles.
                    </SheetDescription>
                </div>

                {/* LISTA DE ENLACES */}
                <div className="flex flex-col gap-1 p-4">
                    {routes.map((route) => {
                        const fullPath = `/${slug}${route.href}`;
                        // Lógica para marcar activo (incluyendo sub-rutas)
                        const isActive = pathname === fullPath || pathname?.startsWith(`${fullPath}/`);

                        return (
                            <Link
                                key={route.href}
                                href={fullPath}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    isActive 
                                        ? "bg-indigo-50 text-indigo-600" 
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <route.icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-slate-400")} />
                                {route.label}
                            </Link>
                        )
                    })}
                </div>
            </SheetContent>
        </Sheet>
    );
}