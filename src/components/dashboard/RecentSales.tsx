import { Avatar, AvatarFallback } from "@/components/ui/avatar" // Asegúrate de tener Avatar, si no, usa div simple

export function RecentSales() {
  return (
    <div className="space-y-8">
      {/* Item 1 */}
      <div className="flex items-center">
        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-4">
          JP
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Juan Pérez</p>
          <p className="text-sm text-muted-foreground">juan@email.com</p>
        </div>
        <div className="ml-auto font-medium">+$45.000</div>
      </div>

      {/* Item 2 */}
      <div className="flex items-center">
        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold mr-4">
          CC
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Camila Cerda</p>
          <p className="text-sm text-muted-foreground">camila@email.com</p>
        </div>
        <div className="ml-auto font-medium">+$120.000</div>
      </div>
       {/* Item 3 */}
       <div className="flex items-center">
        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-4">
          RA
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Roberto Araya</p>
          <p className="text-sm text-muted-foreground">roberto@email.com</p>
        </div>
        <div className="ml-auto font-medium">+$35.000</div>
      </div>
    </div>
  )
}