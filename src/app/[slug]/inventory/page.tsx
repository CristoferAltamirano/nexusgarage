import { db } from "@/lib/db";
import { CreateProductDialog } from "@/components/inventory/CreateProductDialog";
import { DeleteProductButton } from "@/components/inventory/DeleteProductButton";
import { EditProductDialog } from "@/components/inventory/EditProductDialog";
import { Badge } from "@/components/ui/badge";
import { Package, Wrench, ScanBarcode, AlertCircle } from "lucide-react";
import Search from "@/components/ui/search"; 

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InventoryPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const query = typeof searchParams.query === "string" ? searchParams.query : "";

  const tenant = await db.tenant.findUnique({ where: { slug: params.slug } });
  if (!tenant) return <div>Error: Taller no encontrado</div>;

  const products = await db.serviceProduct.findMany({
    where: { 
        tenantId: tenant.id,
        deletedAt: null, 
        OR: query ? [
            { name: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
        ] : undefined
    },
    orderBy: { name: 'asc' },
    take: 100 
  });

  return (
    <div className="w-full max-w-[100vw] flex-1 space-y-8 p-4 md:p-8 pt-6 pb-20 overflow-x-hidden">
      
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Inventario</h2>
          <p className="text-slate-500 text-sm mt-1">Gestiona repuestos y precios.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          
          <div className="relative w-full md:w-80">
            <Search placeholder="Buscar ítem, código..." />
          </div>
          
          <div className="shrink-0">
            <CreateProductDialog tenantId={tenant.id} slug={params.slug} />
          </div>
        </div>
      </div>

      {/* TABLA RESPONSIVA */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
            <table className="w-full caption-bottom text-sm min-w-[800px]">
                <thead className="bg-slate-50">
                    <tr className="border-b border-slate-100">
                        <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs w-[120px]">
                            Código
                        </th>
                        <th className="h-10 px-4 md:px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs">
                            Ítem / Producto
                        </th>
                        <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden sm:table-cell">
                            Categoría
                        </th>
                        <th className="h-10 px-4 md:px-6 text-center align-middle font-medium text-slate-500 uppercase text-xs">
                            Stock
                        </th>
                        <th className="h-10 px-4 md:px-6 text-right align-middle font-medium text-slate-500 uppercase text-xs">
                            Precio
                        </th>
                        <th className="h-10 px-4 md:px-6 w-[100px]"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500">
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                    <Package className="h-10 w-10 mb-2 opacity-20" />
                                    <p>{query ? "No encontramos resultados." : "No se encontraron ítems."}</p>
                                </div>
                            </td>
                        </tr>
                    )}
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                            
                            <td className="p-6 align-middle">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <ScanBarcode className="h-3 w-3 opacity-50" />
                                    <span className="font-mono text-xs">{product.code || "---"}</span>
                                </div>
                            </td>

                            <td className="p-4 md:p-6 align-middle">
                                <div className="flex items-center gap-3">
                                    <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center border ${
                                        product.category === 'Mano de Obra' 
                                            ? 'bg-blue-50 border-blue-100 text-blue-600' 
                                            : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                    }`}>
                                        {product.category === 'Mano de Obra' ? <Wrench className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-700 text-sm">
                                            {product.name}
                                        </span>
                                    </div>
                                </div>
                            </td>

                            <td className="p-6 align-middle hidden sm:table-cell">
                                <Badge variant="secondary" className="bg-slate-50 text-slate-700 font-normal whitespace-nowrap">
                                    {product.category}
                                </Badge>
                            </td>

                            <td className="p-6 align-middle text-center">
                                {product.category === 'Mano de Obra' ? (
                                    <span className="text-slate-300 text-lg">∞</span>
                                ) : (
                                    <div className={`inline-flex items-center gap-1.5 font-bold ${
                                        product.stock <= 5 ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs' : 'text-slate-600'
                                    }`}>
                                        {product.stock <= 5 && <AlertCircle className="h-3 w-3" />}
                                        {product.stock}
                                    </div>
                                )}
                            </td>

                            <td className="p-4 md:p-6 align-middle text-right font-mono font-medium text-slate-700 text-sm">
                                ${product.netPrice.toLocaleString("es-CL")}
                            </td>

                            <td className="p-4 md:p-6 align-middle text-right">
                                <div className="flex items-center justify-end gap-1">
                                    {/* SE CORRIGE EL ERROR PASANDO EL tenantId REQUERIDO */}
                                    <EditProductDialog
                                        product={product}
                                        tenantId={tenant.id}
                                        slug={params.slug}
                                    />

                                    <DeleteProductButton 
                                        id={product.id} 
                                        tenantId={tenant.id}
                                        slug={params.slug} 
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}