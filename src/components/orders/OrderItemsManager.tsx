"use client"

import { useState } from "react";
import { addItem, deleteItem } from "@/actions/manage-items";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, PackageOpen } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Item {
    id: string;
    description: string;
    quantity: number;
    price: number;
    productId?: string | null;
}

interface Product {
    id: string;
    name: string;
    netPrice: number;
    category: string;
    stock: number;
}

interface Props {
    workOrderId: string;
    items: Item[];
    inventory: Product[];
}

export function OrderItemsManager({ workOrderId, items, inventory }: Props) {
    const router = useRouter();

    const [desc, setDesc] = useState("");
    const [price, setPrice] = useState("");
    const [qty, setQty] = useState("1");
    const [selectedProductId, setSelectedProductId] = useState("");

    const handleSelectProduct = (prodId: string) => {
        const product = inventory.find(p => p.id === prodId);
        if (product) {
            setDesc(product.name);
            setPrice(product.netPrice.toString());
            setSelectedProductId(product.id);
        }
    };

    async function handleAdd(formData: FormData) {
        if (!formData.get("description")) return;

        await addItem(formData);
        toast.success("Ítem agregado");
        
        setDesc("");
        setPrice("");
        setQty("1");
        setSelectedProductId("");
        router.refresh();
    }

    async function handleDelete(id: string) {
        await deleteItem(id, workOrderId);
        toast.success("Ítem eliminado");
        router.refresh();
    }

    const totalNeto = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const iva = totalNeto * 0.19;
    const totalFinal = totalNeto + iva;

    return (
        <div className="space-y-6">
            {/* 1. FORMULARIO */}
            <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Agregar Ítem
                    </h3>
                    
                    <div className="w-64">
                        <Select onValueChange={handleSelectProduct}>
                            <SelectTrigger className="bg-white h-8 text-xs">
                                <SelectValue placeholder="📥 Cargar desde Inventario..." />
                            </SelectTrigger>
                            <SelectContent>
                                {inventory.map((prod) => (
                                    <SelectItem key={prod.id} value={prod.id}>
                                        {prod.name} (${prod.netPrice})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <form action={handleAdd} className="flex gap-2 items-end">
                    <input type="hidden" name="workOrderId" value={workOrderId} />
                    <input type="hidden" name="productId" value={selectedProductId} />
                    
                    <div className="flex-1">
                        <Input 
                            name="description" 
                            placeholder="Descripción" 
                            required 
                            className="bg-white"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>
                    
                    <div className="w-20">
                        <Input 
                            name="quantity" 
                            type="number" 
                            min="1" 
                            placeholder="Cant." 
                            required 
                            className="bg-white text-center"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                        />
                    </div>

                    <div className="w-32">
                        <Input 
                            name="price" 
                            type="number" 
                            placeholder="Precio" 
                            required 
                            className="bg-white"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>

                    <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
                        <Plus className="h-4 w-4" />
                    </Button>
                </form>
            </div>

            {/* 2. LISTA DE ÍTEMS */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-500 font-medium">
                        <tr>
                            <th className="p-3">Descripción</th>
                            <th className="p-3 text-center">Cant.</th>
                            <th className="p-3 text-right">Precio Unit.</th>
                            <th className="p-3 text-right">Total</th>
                            <th className="p-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                                    No hay ítems cargados.
                                </td>
                            </tr>
                        )}
                        {items.map((item) => (
                            <tr key={item.id} className="bg-white">
                                <td className="p-3 font-medium flex items-center gap-2">
                                    {/* CORRECCIÓN AQUÍ: Envolvemos el icono en un span para el título */}
                                    {item.productId && (
                                        <span title="Producto de Inventario">
                                            <PackageOpen className="h-3 w-3 text-indigo-400" />
                                        </span>
                                    )}
                                    {item.description}
                                </td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">${item.price.toLocaleString("es-CL")}</td>
                                <td className="p-3 text-right font-bold text-slate-700">
                                    ${(item.price * item.quantity).toLocaleString("es-CL")}
                                </td>
                                <td className="p-3 text-center">
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-400 hover:text-red-600 transition"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 3. TOTALES */}
            <div className="flex justify-end">
                <div className="w-64 bg-slate-50 p-4 rounded-xl space-y-2 border">
                    <div className="flex justify-between text-slate-600 text-sm">
                        <span>Neto</span>
                        <span>${totalNeto.toLocaleString("es-CL")}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-sm">
                        <span>IVA (19%)</span>
                        <span>${iva.toLocaleString("es-CL")}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-indigo-900 border-t pt-2 border-slate-200">
                        <span>TOTAL</span>
                        <span>${totalFinal.toLocaleString("es-CL")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}