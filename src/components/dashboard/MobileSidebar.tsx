"use client";

import { 
    Sheet, 
    SheetContent, 
    SheetTrigger, 
    SheetTitle,
    SheetDescription 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Wrench } from "lucide-react"; 
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
    LayoutDashboard, 
    Users, 
    Car, 
    FileText, 
    Settings, 
    Package 
} from "lucide-react";

// Definimos las rutas
const routes = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/customers", label: "Clientes", icon: Users },
    { href: "/vehicles", label: "Vehículos", icon: Car },
    { href: "/orders", label: "Órdenes", icon: FileText },
    { href: "/settings/catalog", label: "Inventario", icon: Package },
    { href: "/settings", label: "Configuración", icon: Settings },
];

export const MobileSidebar = ({ slug }: { slug: string }) => {
    const pathname = usePathname();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden pr-4 hover:bg-transparent -ml-2">
                    <Menu className="h-6 w-6 text-slate-700" />
                </Button>
            </SheetTrigger>
            
            {/* FONDO OSCURO Y BORDE SUTIL */}
            <SheetContent side="left" className="p-0 bg-slate-950 w-72 border-r-slate-800 text-white">
                
                <div className="p-6 h-full flex flex-col">
                    
                    {/* LOGO */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-orange-600 p-2 rounded-lg shadow-lg shadow-orange-900/20">
                            <Wrench className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <SheetTitle className="text-xl font-bold text-white tracking-tight leading-none">
                                NEXUS
                            </SheetTitle>
                            <span className="text-[10px] font-bold text-orange-500 tracking-wider uppercase">Garage OS</span>
                        </div>
                        <SheetDescription className="hidden">Navegación</SheetDescription>
                    </div>

                    {/* LISTA DE NAVEGACIÓN */}
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">
                            Menú Principal
                        </h3>
                        <div className="flex flex-col gap-1">
                            {routes.map((route) => {
                                const fullPath = `/${slug}${route.href}`;
                                
                                // --- CORRECCIÓN DE LA LÓGICA ---
                                const isActive = 
                                    pathname === fullPath || 
                                    (
                                        pathname?.startsWith(fullPath) && 
                                        route.href !== "/dashboard" &&
                                        // Aquí está el truco: Si la ruta es '/settings', 
                                        // forzamos a que sea falso si estamos en '/settings/catalog'
                                        !(route.href === "/settings" && pathname?.includes("/settings/catalog"))
                                    );

                                return (
                                    <Link
                                        key={route.href}
                                        href={fullPath}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                                            isActive 
                                                ? "bg-slate-800 text-white shadow-sm border border-slate-700/50" // Activo
                                                : "text-slate-400 hover:text-white hover:bg-slate-900/50"       // Inactivo
                                        )}
                                    >
                                        <route.icon className={cn(
                                            "h-5 w-5 transition-colors", 
                                            isActive ? "text-orange-500" : "text-slate-500 group-hover:text-slate-300"
                                        )} />
                                        {route.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-auto px-2 py-4 border-t border-slate-800">
                        <p className="text-[10px] text-slate-600 text-center">
                            Nexus Garage v1.0
                        </p>
                    </div>
                </div>

            </SheetContent>
        </Sheet>
    );
}