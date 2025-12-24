"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { addOrderItem, deleteOrderItem } from "@/actions/orders"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Trash2, Plus, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  netPrice: number;
  stock: number;
  category: string;
}

interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface Props {
  orderId: string;
  initialItems: OrderItem[]; 
  products: Product[];
  slug: string;
  taxRate: number; // <--- 1. AGREGAMOS EL PROP DEL IMPUESTO
}

export function OrderItems({ orderId, initialItems = [], products = [], slug, taxRate }: Props) {
  const router = useRouter(); 
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  
  const items = initialItems;

  // 2. CÁLCULO DINÁMICO (Usando el taxRate que viene de la BD)
  const netTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Evitamos errores si taxRate es null o undefined tratándolo como 0
  const currentTaxRate = taxRate || 0;
  
  // Calculamos el monto del impuesto
  const tax = netTotal * (currentTaxRate / 100); 
  
  const total = netTotal + tax;

  const handleAddItem = async () => {
    if (!selectedProductId) return toast.error("Selecciona un producto");
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("productId", selectedProductId);
    formData.append("quantity", quantity.toString());
    formData.append("slug", slug);

    try {
      const res = await addOrderItem(formData);
      if (res.success) {
        toast.success("Ítem agregado");
        setSelectedProductId(""); 
        setQuantity(1);
        router.refresh(); 
      } else {
        toast.error(res.error || "Error al agregar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setIsLoading(true);
    try {
      const res = await deleteOrderItem(itemId, orderId, slug);
      if (res.success) {
        toast.success("Ítem eliminado");
        router.refresh(); 
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Error al eliminar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-indigo-600" />
          Presupuesto y Servicios
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* FORMULARIO AGREGAR */}
        <div className="flex flex-col md:flex-row gap-3 items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="w-full md:flex-1 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Agregar Ítem</label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccionar del Inventario..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} - {formatCurrency(p.netPrice)} (Stock: {p.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-24 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Cant.</label>
            <Input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="bg-white text-center"
            />
          </div>

          <Button 
            onClick={handleAddItem} 
            disabled={isLoading || !selectedProductId}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {/* TABLA DE ÍTEMS */}
        <div className="rounded-md border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-center w-20">Cant.</th>
                <th className="px-4 py-3 text-right">Precio Unit.</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No hay ítems registrados.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-700">{item.description}</td>
                    <td className="px-4 py-3 text-center text-slate-600 bg-slate-50/30 font-mono">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={isLoading}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* TOTALES */}
        <div className="flex flex-col items-end gap-2 pt-2 text-sm text-slate-600">
          <div className="flex justify-between w-48">
            <span>Neto</span>
            <span>{formatCurrency(netTotal)}</span>
          </div>
          
          {/* 3. AQUÍ MOSTRAMOS EL IVA DINÁMICO */}
          <div className="flex justify-between w-48">
            <span>IVA ({currentTaxRate}%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>

          <div className="flex justify-between w-48 pt-2 border-t border-slate-200 font-bold text-lg text-indigo-900">
            <span>TOTAL</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}