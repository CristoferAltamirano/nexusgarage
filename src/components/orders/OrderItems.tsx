"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Package, Wrench } from "lucide-react";
import { toast } from "sonner";
// import { addItemToOrder, removeItemFromOrder } from "@/actions/order-items"; // Descomenta cuando tengas tus server actions

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
  products: Product[]; // Inventario para el select
}

export function OrderItems({ orderId, initialItems, products }: Props) {
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [loading, setLoading] = useState(false);

  // Estados del formulario
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState(0);

  // Cálculos
  const netTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Math.round(netTotal * 0.19); // IVA 19%
  const total = netTotal + tax;

  const handleAddItem = async () => {
    if(!selectedProduct) return;
    const product = products.find(p => p.id === selectedProduct);
    if(!product) return;

    // Aquí iría tu llamada a la Server Action real
    // await addItemToOrder(orderId, product.id, quantity, customPrice || product.netPrice);
    
    // Simulación visual para que veas el diseño
    const newItem: OrderItem = {
        id: Math.random().toString(),
        description: product.name,
        quantity: quantity,
        price: customPrice || product.netPrice,
        productId: product.id
    };
    
    setItems([...items, newItem]);
    toast.success("Ítem agregado");
    setQuantity(1);
    setCustomPrice(0);
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      
      {/* Título de la Sección */}
      <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-lg text-slate-900">Presupuesto y Servicios</h3>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        
        {/* --- FORMULARIO RESPONSIVO --- */}
        {/* En móvil es columna (space-y-3), en PC es fila (md:flex-row) */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row gap-3 items-end">
            
            {/* Selector de Producto (Ocupa todo el ancho en móvil) */}
            <div className="w-full md:flex-1 space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase">Agregar Ítem</label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    value={selectedProduct}
                    onChange={(e) => {
                        setSelectedProduct(e.target.value);
                        const prod = products.find(p => p.id === e.target.value);
                        if(prod) setCustomPrice(prod.netPrice);
                    }}
                >
                    <option value="">Seleccionar del Inventario...</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - ${p.netPrice}</option>
                    ))}
                </select>
            </div>

            {/* Contenedor para Cantidad, Precio y Botón */}
            <div className="flex w-full md:w-auto gap-2">
                
                {/* Cantidad */}
                <div className="w-20 space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 uppercase md:hidden">Cant.</label>
                    <Input 
                        type="number" 
                        min="1" 
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        className="bg-white"
                        placeholder="1"
                    />
                </div>

                {/* Precio */}
                <div className="flex-1 md:w-32 space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 uppercase md:hidden">Precio</label>
                    <Input 
                        type="number" 
                        value={customPrice}
                        onChange={(e) => setCustomPrice(parseFloat(e.target.value))}
                        className="bg-white"
                        placeholder="Precio"
                    />
                </div>

                {/* Botón Agregar */}
                <Button onClick={handleAddItem} className="bg-orange-600 hover:bg-orange-700 h-10 w-12 md:mb-0 shrink-0">
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        </div>

        {/* --- TABLA CON SCROLL HORIZONTAL --- */}
        {/* overflow-x-auto permite deslizar la tabla si no cabe en el celular */}
        <div className="rounded-lg border border-slate-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="h-9 px-4 text-left font-medium text-slate-500">Descripción</th>
                        <th className="h-9 px-4 text-center font-medium text-slate-500 w-16">Cant.</th>
                        <th className="h-9 px-4 text-right font-medium text-slate-500 w-28">Precio Unit.</th>
                        <th className="h-9 px-4 text-right font-medium text-slate-500 w-28">Total</th>
                        <th className="h-9 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">
                                No hay ítems en esta orden.
                            </td>
                        </tr>
                    )}
                    {items.map((item) => (
                        <tr key={item.id} className="group hover:bg-slate-50/50">
                            <td className="p-3 align-middle">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-blue-50 text-blue-600">
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
                                <button className="text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* --- TOTALES --- */}
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