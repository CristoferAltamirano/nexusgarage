import { COUNTRIES, CountryCode } from "@/config/localization";

export const formatCurrency = (amount: number, countryCode: string = 'CL') => {
  // Buscamos la config del país, si no existe, usamos Chile
  const country = COUNTRIES[countryCode as CountryCode] || COUNTRIES['CL'];
  
  return new Intl.NumberFormat('es-CL', { // Usamos es-CL como base para formato numérico (puntos y comas)
    style: 'currency',
    currency: country.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};