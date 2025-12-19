'use client';

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button 
      variant="outline" 
      onClick={() => window.print()} 
      className="gap-2 print:hidden" // <--- AGREGAMOS ESTO
    >
      <Printer size={16}/> Imprimir
    </Button>
  );
}