import { db } from "@/lib/db";
import { CreateProductDialog } from "@/components/inventory/CreateProductDialog";
import { DeleteProductButton } from "@/components/inventory/DeleteProductButton"; // (Lo haremos abajo pequeño)
import { Badge } from "@/components/ui/badge";
import { Package, Search, Wrench } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function InventoryPage(props: Props) {
  const params = await props.params;
  
  const tenant = await db.tenant.findUnique({
    where: { slug: params.slug }
  });

  if (!tenant) return <div>Error</div>;

  // Cargar productos
  const products = await db.serviceProduct.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Inventario y Servicios</h2>
        <CreateProductDialog tenantId={tenant.id} slug={params.slug} />
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b">
                <tr>
                    <th className="p-4 font-medium text-slate-500">Código</th>
                    <th className="p-4 font-medium text-slate-500">Nombre</th>
                    <th className="p-4 font-medium text-slate-500">Categoría</th>
                    <th className="p-4 font-medium text-slate-500 text-center">Stock</th>
                    <th className="p-4 font-medium text-slate-500 text-right">Precio Neto</th>
                    <th className="p-4 font-medium text-slate-500 w-10"></th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {products.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                            Tu inventario está vacío. Agrega tu primer servicio o repuesto arriba.
                        </td>
                    </tr>
                )}
                {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 text-slate-400 font-mono text-xs">
                            {product.code || "-"}
                        </td>
                        <td className="p-4 font-medium text-slate-700">
                            {product.name}
                        </td>
                        <td className="p-4">
                            <Badge variant="secondary" className={
                                product.category === 'Mano de Obra' 
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }>
                                {product.category === 'Mano de Obra' && <Wrench className="w-3 h-3 mr-1"/>}
                                {product.category !== 'Mano de Obra' && <Package className="w-3 h-3 mr-1"/>}
                                {product.category}
                            </Badge>
                        </td>
                        <td className="p-4 text-center">
                            {product.category === 'Mano de Obra' ? (
                                <span className="text-slate-300">-</span>
                            ) : (
                                <span className={`font-bold ${product.stock < 5 ? 'text-red-500' : 'text-slate-600'}`}>
                                    {product.stock}
                                </span>
                            )}
                        </td>
                        <td className="p-4 text-right font-mono">
                            ${product.netPrice.toLocaleString("es-CL")}
                        </td>
                        <td className="p-4">
                            {/* Componente pequeño para borrar */}
                            <DeleteProductButton id={product.id} slug={params.slug} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}