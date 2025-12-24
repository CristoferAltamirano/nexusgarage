"use client";

import { useState } from "react";
import { deleteCustomer } from "@/actions/customers"; 
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
  tenantId: string; // Se mantiene en la interfaz para evitar errores en el componente padre
  slug: string;     // Se mantiene por compatibilidad
}

export function DeleteCustomerButton({ id }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Solo necesitamos el ID, el tenant se valida en el servidor
      const res = await deleteCustomer(id);
      
      if (res.success) {
        toast.success("Cliente enviado a la papelera correctamente");
      } else {
        toast.error(res.error || "No se pudo eliminar el cliente");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al eliminar");
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
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Esta acción enviará al cliente a la papelera de reciclaje. 
            Sus datos y vehículos asociados dejarán de ser visibles en los listados activos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              // Evitamos que el diálogo se cierre automáticamente antes de terminar la acción
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