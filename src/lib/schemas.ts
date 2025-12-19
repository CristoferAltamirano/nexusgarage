import { z } from "zod";

// Reglas para Cliente
export const customerSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 letras"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 letras"),
  taxId: z.string().min(1, "El RUT es obligatorio"), // Podrías agregar regex de RUT aquí
  phone: z.string().min(8, "El teléfono es muy corto"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  isCompany: z.optional(z.any()), // Checkboxes a veces envían "on" o nada
});

// Reglas para Producto
export const productSchema = z.object({
  name: z.string().min(3, "El nombre es muy corto"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  stock: z.number().int("El stock debe ser entero").min(0),
  category: z.string()
});
// ... (mantén lo de productSchema y customerSchema que ya tenías)

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
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  taxId: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(8),
  
  plate: z.string().min(4, "Patente inválida"),
  brand: z.string().min(2),
  model: z.string().min(2),
  
  description: z.string().min(5, "Falta descripción del problema"),
  kilometer: z.coerce.number().min(0), // "coerce" convierte texto a número
  fuelLevel: z.coerce.number().min(0).max(8), // De 0 a 8 rayitas
});