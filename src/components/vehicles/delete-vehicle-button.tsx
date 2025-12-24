"use client";

import { useState } from "react";
import { deleteVehicle } from "@/actions/delete-vehicle";
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
  tenantId: string;
  slug: string;
}

export function DeleteVehicleButton({ id, tenantId, slug }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteVehicle(id, tenantId, slug);
      toast.success("Vehículo eliminado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el vehículo");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
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
            Esta acción enviará el vehículo a la papelera. Podrás restaurarlo después si contactas a soporte.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            // 🔥 AQUÍ ESTÁ EL FIX DE TYPESCRIPT:
            // Agregamos el tipo ": React.MouseEvent"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault(); 
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Sí, Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}