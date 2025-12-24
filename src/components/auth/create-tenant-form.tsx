"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, PlusCircle } from "lucide-react";
// ✅ CORRECCIÓN: Importamos la acción desde el archivo centralizado
import { registerTenant } from "@/actions/auth"; 

export function CreateTenantForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      // ✅ CORRECCIÓN: Usamos la nueva acción registerTenant
      const result = await registerTenant(formData);
      
      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      }
      // Si tiene éxito, la acción misma hace el redirect, no necesitas hacer nada más aquí.
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado. Inténtalo de nuevo.");
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre de tu Taller</Label>
            <Input
              id="name"
              name="name" // Se mantiene igual para que el FormData lo capture
              placeholder="Ej: Nitro Garage"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
            <p className="text-[0.8rem] text-muted-foreground">
              Esto creará tu dirección web única.
            </p>
          </div>
          <Button disabled={isLoading} className="bg-orange-600 hover:bg-orange-700 text-white w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Comenzar
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}