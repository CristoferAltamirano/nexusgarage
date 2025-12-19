"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Wrench, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addOrderItem } from "@/actions/add-item";
import { deleteOrderItem } from "@/actions/delete-item"; // Importamos la nueva acción

interface Product {
  id: string;
  name: string;
  netPrice: number;
  category: string;
  stock: number;
}

interface OrderItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  productId?: string | null;
}

interface Props {
  orderId: string;
  initialItems: OrderItem[];
  products: Product[];
}

export function OrderItems({ orderId, initialItems, products }: Props) {
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState(0);

  const netTotal = initialItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Math.round(netTotal * 0.19);
  const total = netTotal + tax;

  const handleAddItem = async () => {
    if (!selectedProduct) {
      toast.error("Selecciona un producto");
      return;
    }
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    setLoading(true);
    try {
      const result = await addOrderItem(orderId, product.name, quantity, customPrice || product.netPrice);
      if (result.success) {
        toast.success("Ítem agregado 💰");
        setSelectedProduct("");
        setQuantity(1);
        setCustomPrice(0);
      }
    } catch (error) {
      toast.error("Error al agregar");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    setDeletingId(itemId);
    try {
      const result = await deleteOrderItem(itemId, orderId);
      if (result.success) {
        toast.success("Ítem eliminado");
      } else {
        toast.error("No se pudo eliminar");
      }
    } catch (error) {
      toast.error("Error inesperado");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-lg text-slate-900">Presupuesto y Servicios</h3>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        {/* Formulario */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row gap-3 items-end">
          <div className="w-full md:flex-1 space-y-1.5">
            <label className="text-xs font-medium text-slate-500 uppercase">Agregar Ítem</label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-orange-500 outline-none"
              value={selectedProduct}
              disabled={loading}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                const prod = products.find(p => p.id === e.target.value);
                if(prod) setCustomPrice(prod.netPrice);
              }}
            >
              <option value="">Seleccionar del Inventario...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - ${p.netPrice.toLocaleString("es-CL")}</option>
              ))}
            </select>
          </div>

          <div className="flex w-full md:w-auto gap-2">
            <div className="w-20 space-y-1.5">
              <Input type="number" min="1" value={quantity} disabled={loading} onChange={(e) => setQuantity(parseInt(e.target.value))} className="bg-white" />
            </div>
            <div className="flex-1 md:w-32 space-y-1.5">
              <Input type="number" value={customPrice} disabled={loading} onChange={(e) => setCustomPrice(parseFloat(e.target.value))} className="bg-white" />
            </div>
            <Button onClick={handleAddItem} disabled={loading} className="bg-orange-600 hover:bg-orange-700 h-10 w-12 text-white shrink-0">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-lg border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="h-9 px-4 text-left font-medium text-slate-500 uppercase text-[10px]">Descripción</th>
                <th className="h-9 px-4 text-center font-medium text-slate-500 uppercase text-[10px] w-16">Cant.</th>
                <th className="h-9 px-4 text-right font-medium text-slate-500 uppercase text-[10px] w-28">Precio Unit.</th>
                <th className="h-9 px-4 text-right font-medium text-slate-500 uppercase text-[10px] w-28">Total</th>
                <th className="h-9 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialItems.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No hay ítems registrados.</td></tr>
              )}
              {initialItems.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50">
                  <td className="p-3 align-middle">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-blue-50 text-blue-600 border-0">
                        <Wrench className="h-3 w-3" />
                      </Badge>
                      <span className="font-medium text-slate-700">{item.description}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center align-middle">{item.quantity}</td>
                  <td className="p-3 text-right align-middle text-slate-500">${item.price.toLocaleString("es-CL")}</td>
                  <td className="p-3 text-right align-middle font-bold text-slate-900">
                    ${(item.price * item.quantity).toLocaleString("es-CL")}
                  </td>
                  <td className="p-3 text-center align-middle">
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={deletingId === item.id}
                      className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="flex flex-col items-end gap-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between w-full md:w-64 text-sm text-slate-500">
            <span>Neto</span>
            <span>${netTotal.toLocaleString("es-CL")}</span>
          </div>
          <div className="flex justify-between w-full md:w-64 text-sm text-slate-500">
            <span>IVA (19%)</span>
            <span>${tax.toLocaleString("es-CL")}</span>
          </div>
          <div className="flex justify-between w-full md:w-64 text-lg font-bold text-orange-900 mt-1 pt-2 border-t border-slate-100">
            <span>TOTAL</span>
            <span>${total.toLocaleString("es-CL")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}