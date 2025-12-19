import { db } from "@/lib/db";
import { CreateProductDialog } from "@/components/inventory/CreateProductDialog";
import { DeleteProductButton } from "@/components/inventory/DeleteProductButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Wrench, ScanBarcode, AlertCircle, Layers } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function CatalogPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";

  const tenant = await db.tenant.findUnique({ where: { slug: params.slug } });
  if (!tenant) return <div>Error: Taller no encontrado</div>;

  const products = await db.serviceProduct.findMany({
    where: { 
        tenantId: tenant.id,
        deletedAt: null, 
        OR: query ? [
            { name: { contains: query, mode: 'insensitive' } },
            { code: { contains: query, mode: 'insensitive' } },
        ] : undefined
    },
    orderBy: { name: 'asc' },
    take: 100 
  });

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Inventario</h2>
          <p className="text-slate-500 text-sm mt-1">Gestiona repuestos y precios.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                name="q" 
                placeholder="Buscar ítem..." 
                className="pl-10 h-10 w-full bg-white" 
                defaultValue={query} 
            />
          </div>
          <div className="shrink-0">
            <CreateProductDialog tenantId={tenant.id} slug={params.slug} />
          </div>
        </div>
      </div>

      {/* TABLA RESPONSIVA */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
                <thead className="bg-slate-50">
                    <tr className="border-b border-slate-100">
                        {/* CÓDIGO: Oculto en celular (hidden md:table-cell) */}
                        <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs w-[120px] hidden md:table-cell">
                            Código
                        </th>
                        
                        {/* NOMBRE: Siempre visible (Columna principal) */}
                        <th className="h-10 px-4 md:px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs">
                            Ítem / Producto
                        </th>
                        
                        {/* CATEGORÍA: Oculto en celular y tablet pequeña (hidden lg:table-cell) */}
                        <th className="h-10 px-6 text-left align-middle font-medium text-slate-500 uppercase text-xs hidden lg:table-cell">
                            Categoría
                        </th>
                        
                        {/* STOCK: Oculto en celular (hidden sm:table-cell) - Se fusiona con Nombre en móvil */}
                        <th className="h-10 px-4 md:px-6 text-center align-middle font-medium text-slate-500 uppercase text-xs hidden sm:table-cell">
                            Stock
                        </th>
                        
                        {/* PRECIO: Siempre visible */}
                        <th className="h-10 px-4 md:px-6 text-right align-middle font-medium text-slate-500 uppercase text-xs">
                            Precio
                        </th>
                        
                        <th className="h-10 px-4 md:px-6 w-[50px] md:w-[80px]"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500">
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                    <Package className="h-10 w-10 mb-2 opacity-20" />
                                    <p>No se encontraron ítems.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                            
                            {/* COLUMNA 1: CÓDIGO (Solo PC) */}
                            <td className="p-6 align-middle hidden md:table-cell">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <ScanBarcode className="h-3 w-3 opacity-50" />
                                    <span className="font-mono text-xs">{product.code || "---"}</span>
                                </div>
                            </td>

                            {/* COLUMNA 2: NOMBRE (+ Stock y Código en móvil) */}
                            <td className="p-4 md:p-6 align-middle">
                                <div className="flex items-center gap-3">
                                    {/* Icono de categoría */}
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
                                        
                                        {/* INFO MÓVIL: Código y Stock aparecen aquí abajo en celulares */}
                                        <div className="flex items-center gap-2 mt-1 md:hidden">
                                            {product.code && (
                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1 rounded">
                                                    {product.code}
                                                </span>
                                            )}
                                            
                                            {/* Badge de Stock Móvil */}
                                            {product.category !== 'Mano de Obra' && (
                                                <span className={`text-[10px] font-bold px-1.5 rounded-full ${
                                                    product.stock <= 5 
                                                        ? 'bg-red-100 text-red-600' 
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                    Stock: {product.stock}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* COLUMNA 3: CATEGORÍA (Solo Pantallas Grandes) */}
                            <td className="p-6 align-middle hidden lg:table-cell">
                                <Badge variant="secondary" className="bg-slate-50 text-slate-700 font-normal">
                                    {product.category}
                                </Badge>
                            </td>

                            {/* COLUMNA 4: STOCK (Solo Tablet/PC) */}
                            <td className="p-6 align-middle text-center hidden sm:table-cell">
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

                            {/* COLUMNA 5: PRECIO */}
                            <td className="p-4 md:p-6 align-middle text-right font-mono font-medium text-slate-700 text-sm">
                                ${product.netPrice.toLocaleString("es-CL")}
                            </td>

                            {/* COLUMNA 6: ACCIONES */}
                            <td className="p-4 md:p-6 align-middle text-right">
                                <DeleteProductButton id={product.id} slug={params.slug} />
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