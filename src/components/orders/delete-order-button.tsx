"use client";

import { useState } from "react";
import { deleteOrder } from "@/actions/orders"; // ✅ Importación correcta al archivo maestro
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
  // Mantenemos estos props opcionales para evitar errores si el componente padre los envía,
  // aunque la lógica interna solo necesita el ID.
  tenantId?: string;
  slug?: string;
}

export function DeleteOrderButton({ id }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Llamamos a la Server Action
      const res = await deleteOrder(id);
      
      if (res.success) {
        toast.success("Orden eliminada correctamente");
      } else {
        toast.error(res.error || "No se pudo eliminar la orden");
      }
    } catch (error) {
      console.error("Error al eliminar orden:", error);
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
          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
            <AlertDialogTitle>¿Eliminar orden de trabajo?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Esta acción enviará la orden a la papelera. Los ítems y costos asociados dejarán de sumar en los reportes financieros.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e: React.MouseEvent) => {
              // Prevenimos el cierre automático para manejar el estado de carga
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