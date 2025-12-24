import { z } from "zod";

// Reglas para Cliente
export const customerSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 letras"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 letras"),
  taxId: z.string().min(1, "El RUT es obligatorio"),
  phone: z.string().min(8, "El teléfono es muy corto"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  isCompany: z.optional(z.any()), 
});

// Reglas para Producto (CORREGIDO)
export const productSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto"),
  // Usamos coerce para que transforme el string del FormData a number automáticamente
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  stock: z.coerce.number().int("El stock debe ser entero").min(0),
  category: z.string().min(1, "La categoría es obligatoria"),
  // 👇 AQUÍ ESTÁ LA SOLUCIÓN AL ERROR: Agregamos el campo code
  code: z.string().optional().or(z.literal("")), 
});

// Reglas para Configuración del Taller
export const settingsSchema = z.object({
  name: z.string().min(3, "El nombre debe ser real"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  website: z.string().optional(),
});

// Reglas para Crear Orden
export const orderSchema = z.object({
  firstName: z.string().min(2, "Nombre requerido"),
  lastName: z.string().min(2, "Apellido requerido"),
  taxId: z.string().optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().min(8, "Teléfono inválido"),
  
  plate: z.string().min(4, "Patente inválida"),
  brand: z.string().min(2, "Marca requerida"),
  model: z.string().min(2, "Modelo requerido"),
  
  description: z.string().min(5, "Falta descripción del problema"),
  kilometer: z.coerce.number().min(0, "Kilometraje no puede ser negativo"),
  fuelLevel: z.coerce.number().min(0).max(100), 
});