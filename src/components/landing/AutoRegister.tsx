"use client";

import { useEffect, useRef } from "react";
// ✅ CORRECCIÓN: Ruta actualizada al archivo maestro de autenticación
import { registerTenant } from "@/actions/auth"; 
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AutoRegister({ name }: { name: string }) {
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const run = async () => {
            toast.info("Sesión iniciada. Creando tu taller automáticamente...");
            
            const formData = new FormData();
            formData.append("name", name);
            
            try {
                // ✅ Ahora usa la acción importada desde @/actions/auth
                await registerTenant(formData);
            } catch (error) {
                // CORRECCIÓN: Verificamos si es el "error" de redirección de Next.js
                if ((error as Error).message === "NEXT_REDIRECT") {
                    return; // Todo bien, la redirección al dashboard está en curso
                }
                
                console.error(error);
                toast.error("Ocurrió un error al crear el taller.");
            }
        };

        run();
    }, [name]);

    return (
        <div className="fixed inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-50 text-white backdrop-blur-sm">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-indigo-500" />
            <h2 className="text-2xl font-bold">Creando {name}...</h2>
            <p className="text-slate-400 mt-2">Estamos preparando tu dashboard</p>
        </div>
    );
}