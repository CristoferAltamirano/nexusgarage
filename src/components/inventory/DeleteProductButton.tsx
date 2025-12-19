"use client"

import { deleteProduct } from "@/actions/inventory";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ id, slug }: { id: string, slug: string }) {
    const router = useRouter();

    const handleDelete = async () => {
        // Confirmación simple antes de borrar
        if(!confirm("¿Estás seguro de borrar este ítem?")) return;
        
        await deleteProduct(id, slug);
        toast.success("Eliminado");
        router.refresh();
    };

    return (
        <button onClick={handleDelete} className="text-slate-300 hover:text-red-500 transition" title="Borrar">
            <Trash2 className="h-4 w-4" />
        </button>
    );
}