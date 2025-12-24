"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// ✅ CORRECCIÓN: Importamos desde el archivo maestro consolidado
import { deleteProduct } from "@/actions/inventory"; 
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
  // Mantenemos estas props por compatibilidad con el componente padre,
  // aunque la Server Action moderna ya infiere el tenantId por seguridad.
  tenantId?: string; 
  slug?: string;
}

export function DeleteProductButton({ id }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter(); // Hook para refrescar la página sin recargar

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // ✅ Solo enviamos el ID. La lógica de seguridad está en el servidor.
      const res = await deleteProduct(id);

      if (res.success) {
        toast.success("Ítem eliminado correctamente");
        router.refresh(); // Actualiza la tabla visualmente
      } else {
        toast.error(res.error || "No se pudo eliminar el ítem");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado de conexión");
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
            <AlertDialogTitle>¿Eliminar este ítem?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Esta acción enviará el producto a la papelera. 
            El ítem dejará de estar disponible para nuevas órdenes inmediatamente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
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