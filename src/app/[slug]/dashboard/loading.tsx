import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      <div className="flex flex-col items-center gap-4 text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium animate-pulse">Cargando tu taller...</p>
      </div>
    </div>
  );
}