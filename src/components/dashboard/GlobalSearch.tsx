"use client"

import * as React from "react"
import { Search, User, CarFront, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDebounce } from "use-debounce" 

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { searchGlobal } from "@/actions/global-search"

interface Props {
  tenantId: string
  slug: string
}

export function GlobalSearch({ tenantId, slug }: Props) {
  // 1. ESTADO DE MONTAJE (La solución al error de Hidratación)
  const [isMounted, setIsMounted] = React.useState(false)

  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [debouncedQuery] = useDebounce(query, 300) 
  const [data, setData] = React.useState<{
    customers: any[], 
    vehicles: any[]
  }>({ customers: [], vehicles: [] })
  
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  // 2. EFECTO DE MONTAJE
  // Esto asegura que el componente sepa cuándo ya está corriendo en el cliente
  // y evita que los IDs aleatorios del servidor choquen con los del cliente.
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // Abrir con Ctrl+K o Cmd+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Efecto para buscar cuando escribes
  React.useEffect(() => {
    async function fetchData() {
        if (!debouncedQuery) return;
        setLoading(true);
        const results = await searchGlobal(debouncedQuery, tenantId);
        setData(results);
        setLoading(false);
    }
    fetchData();
  }, [debouncedQuery, tenantId]);

  const handleSelect = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  // SI NO ESTÁ MONTADO, PODEMOS RETORNAR NULL O SOLO EL BOTÓN (SKELETON)
  // Para evitar saltos visuales (Layout Shift), renderizamos el botón, 
  // pero NO el CommandDialog hasta que esté montado.
  if (!isMounted) {
    return (
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
      >
        <span className="hidden lg:inline-flex">Buscar...</span>
        <span className="inline-flex lg:hidden">Buscar...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
    )
  }

  return (
    <>
      {/* 1. EL BOTÓN QUE SE VE EN EL HEADER */}
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Buscar...</span>
        <span className="inline-flex lg:hidden">Buscar...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* 2. EL DIÁLOGO QUE SE ABRE (Solo se renderiza tras el montaje) */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
            placeholder="Escribe nombre, rut o patente..." 
            value={query}
            onValueChange={setQuery}
        />
        <CommandList>
          {/* Si no hay resultados y tampoco está cargando, muestra mensaje vacío */}
          {!loading && data.customers.length === 0 && data.vehicles.length === 0 && (
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          )}
          
          {loading && <div className="p-4 flex justify-center text-sm text-muted-foreground"><Loader2 className="animate-spin mr-2"/> Buscando...</div>}

          {/* RESULTADOS DE CLIENTES */}
          {data.customers.length > 0 && (
            <CommandGroup heading="Clientes">
              {data.customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={`${customer.firstName} ${customer.lastName}`} 
                  onSelect={() => handleSelect(`/${slug}/customers`)} 
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{customer.firstName} {customer.lastName}</span>
                  <span className="ml-2 text-xs text-muted-foreground">({customer.taxId})</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />

          {/* RESULTADOS DE VEHÍCULOS */}
          {data.vehicles.length > 0 && (
             <CommandGroup heading="Vehículos">
             {data.vehicles.map((car) => (
               <CommandItem
                 key={car.id}
                 value={car.plateOrSerial}
                 onSelect={() => handleSelect(`/${slug}/vehicles`)} 
               >
                 <CarFront className="mr-2 h-4 w-4" />
                 <span className="font-bold uppercase">{car.plateOrSerial}</span>
                 <span className="ml-2 text-muted-foreground">- {car.brand} {car.model}</span>
               </CommandItem>
             ))}
           </CommandGroup>
          )}

        </CommandList>
      </CommandDialog>
    </>
  )
}