// src/config/localization.ts

export type CountryCode = 'CL' | 'AR' | 'PE' | 'CO' | 'MX' | 'ES' | 'US';

interface CountryConfig {
  name: string;
  currency: string;
  currencySymbol: string;
  taxIdLabel: string;      // El nombre del documento (RUT, CUIT, etc.)
  taxIdPlaceholder: string; // Ejemplo visual
  phoneCode: string;
}

// Aquí definimos las reglas de cada país
export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  CL: {
    name: 'Chile',
    currency: 'CLP',
    currencySymbol: '$',
    taxIdLabel: 'RUT',
    taxIdPlaceholder: '12.345.678-9',
    phoneCode: '+56'
  },
  AR: {
    name: 'Argentina',
    currency: 'ARS',
    currencySymbol: '$',
    taxIdLabel: 'CUIT / DNI',
    taxIdPlaceholder: '20-12345678-9',
    phoneCode: '+54'
  },
  PE: {
    name: 'Perú',
    currency: 'PEN',
    currencySymbol: 'S/',
    taxIdLabel: 'RUC / DNI',
    taxIdPlaceholder: '10123456789',
    phoneCode: '+51'
  },
  CO: {
    name: 'Colombia',
    currency: 'COP',
    currencySymbol: '$',
    taxIdLabel: 'NIT / C.C.',
    taxIdPlaceholder: '900.123.456-1',
    phoneCode: '+57'
  },
  MX: {
    name: 'México',
    currency: 'MXN',
    currencySymbol: '$',
    taxIdLabel: 'RFC',
    taxIdPlaceholder: 'XAXX010101000',
    phoneCode: '+52'
  },
  ES: {
    name: 'España',
    currency: 'EUR',
    currencySymbol: '€',
    taxIdLabel: 'NIF / DNI',
    taxIdPlaceholder: '12345678Z',
    phoneCode: '+34'
  },
  US: {
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    taxIdLabel: 'Tax ID / SSN',
    taxIdPlaceholder: '000-00-0000',
    phoneCode: '+1'
  }
};

// Función de ayuda para obtener la configuración
// Si le pasas un código que no existe, por defecto devuelve Chile ('CL')
export const getCountryConfig = (code: string) => {
  return COUNTRIES[code as CountryCode] || COUNTRIES['CL'];
};