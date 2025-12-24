"use client";

import { useState } from "react";
// ✅ Importación corregida: apunta al archivo maestro
import { deleteVehicle } from "@/actions/vehicles";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  id: string;
  tenantId: string; // Se mantiene por compatibilidad con el componente padre
  slug: string;     // Se mantiene por compatibilidad
}

export function DeleteVehicleButton({ id }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Solo necesitamos el ID, el tenant se valida de forma segura en el servidor
      const res = await deleteVehicle(id);

      if (res.success) {
        toast.success("Vehículo eliminado correctamente");
      } else {
        toast.error(res.error || "Error al eliminar el vehículo");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>¿Eliminar vehículo?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Esta acción enviará el vehículo a la papelera de reciclaje. 
            El historial de órdenes asociado se mantendrá, pero el vehículo dejará de aparecer en las listas activas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e: React.MouseEvent) => {
              // Prevenimos el cierre automático para mostrar el spinner de carga
              e.preventDefault(); 
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Eliminando...
              </>
            ) : (
              "Sí, Eliminar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}