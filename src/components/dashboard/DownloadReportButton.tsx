"use client";

import { Button } from "@/components/ui/button";
import { Loader2, FileSpreadsheet, ChevronDown } from "lucide-react";
// ✅ CAMBIO 1: Importamos la nueva acción correcta
import { getOrdersForExport } from "@/actions/get-orders-export";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DownloadReportButton({ tenantId }: { tenantId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (range: string, label: string) => {
    setLoading(true);
    try {
      // ✅ CAMBIO 2: Llamamos a la función que devuelve ARRAY
      const data = await getOrdersForExport(tenantId, range);

      // ✅ CAMBIO 3: Ahora TypeScript sabe que data es un array, .length funciona
      if (data.length === 0) {
        toast.info(`No hay ingresos para: ${label}`);
        setLoading(false);
        return;
      }

      // El resto de la lógica funciona perfecto porque la estructura coincide
      const totalRevenue = data.reduce((sum, order) => sum + order.total, 0);

      const formattedData: any[] = data.map(row => ({
        "Orden N°": row.id,
        "Fecha": row.fecha,
        "Cliente": row.cliente,
        "RUT": row.rut,
        "Vehículo": row.vehiculo,
        "Patente": row.patente.toUpperCase(),
        "Estado": row.estado,
        "Total ($)": row.total
      }));

      formattedData.push({}); 
      formattedData.push({
        "Orden N°": "",
        "Fecha": "",
        "Cliente": "",
        "RUT": "",
        "Vehículo": "",
        "Patente": "",
        "Estado": "TOTAL:", 
        "Total ($)": totalRevenue
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      const columnWidths = [
        { wch: 10 }, { wch: 12 }, { wch: 30 }, { wch: 12 },
        { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ingresos");

      const dateStr = new Date().toISOString().split('T')[0];
      const cleanLabel = label.toLowerCase().replace(/ /g, "_");
      
      XLSX.writeFile(workbook, `Reporte_${cleanLabel}_${dateStr}.xlsx`);

      toast.success(`Reporte (${label}) descargado`);

    } catch (error) {
      console.error(error);
      toast.error("Error al generar el reporte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
            variant="outline" 
            disabled={loading} 
            className="bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border-slate-200 text-slate-700 transition-all gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          )}
          Reportes Excel
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleDownload("this_month", "Este Mes")}>
            📅 Este Mes (En curso)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("last_month", "Mes Pasado")}>
            ⏪ Mes Pasado (Completo)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("all", "Histórico Total")}>
            📊 Histórico Completo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}