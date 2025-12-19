"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ChartData {
  name: string;
  total: number;
}

interface Props {
  data: ChartData[];
}

export function RevenueChart({ data }: Props) {
  // 1. Manejo de Estado Vacío (Sin datos)
  const hasData = data.length > 0 && data.some(d => d.total > 0);

  if (!hasData) {
    return (
      <Card className="col-span-4 xl:col-span-3 shadow-sm bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">Ingresos Recientes</CardTitle>
        </CardHeader>
        <CardContent className="pl-2 flex h-[350px] items-center justify-center text-slate-400 flex-col gap-2">
          <div className="bg-slate-50 p-4 rounded-full">
             <TrendingUp className="h-8 w-8 opacity-20 text-slate-500" />
          </div>
          <p className="text-sm font-medium">No hay ingresos registrados esta semana.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4 xl:col-span-3 shadow-sm bg-white border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-1">
            <CardTitle className="text-base font-bold text-slate-900">
            Ingresos de la Semana
            </CardTitle>
            <p className="text-xs text-slate-500">Últimos 7 días de operación</p>
        </div>
        {/* Icono actualizado al tema Naranja */}
        <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center border border-orange-100">
            <TrendingUp className="h-4 w-4 text-orange-600" />
        </div>
      </CardHeader>
      
      <CardContent className="pl-2">
        {/* Contenedor con altura fija para evitar errores de redimensionamiento */}
        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              {/* Cuadrícula horizontal tenue */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10} // Espacio extra abajo
              />
              
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                dx={-10} // Espacio extra a la izq
              />
              
              {/* Tooltip personalizado */}
              <Tooltip
                cursor={{ fill: '#fff7ed' }} // Un naranja muy suave al pasar el mouse
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-xl">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase text-slate-500 font-bold">
                            {payload[0].payload.name}
                          </span>
                          {/* Texto del monto en Naranja */}
                          <span className="text-lg font-bold text-orange-600">
                            ${(payload[0].value as number).toLocaleString("es-CL")}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              <Bar
                dataKey="total"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-orange-500" // <--- AQUI ESTÁ EL COLOR NUEVO
                maxBarSize={50} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}