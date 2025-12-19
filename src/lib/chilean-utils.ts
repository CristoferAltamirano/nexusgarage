// src/lib/chilean-utils.ts

/**
 * Normalizes a Chilean RUT (Rol Único Tributario).
 * @param rut The RUT string to normalize.
 * @returns The formatted RUT (e.g., "12.345.678-9") or null if invalid.
 */
export function formatRut(rut: string): string | null {
  if (!rut) return null;

  // Clean the RUT: remove dots and hyphens
  const cleanRut = rut.replace(/[\.\-]/g, "");

  if (cleanRut.length < 2) return null;

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();

  // Basic validation of the body (must be numeric)
  if (!/^\d+$/.test(body)) return null;

  // Format with dots and hyphen
  let formattedBody = "";
  for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
    formattedBody = body.charAt(i) + ((j > 0 && j % 3 === 0) ? "." : "") + formattedBody;
  }

  return `${formattedBody}-${dv}`;
}

/**
 * Validates a Chilean RUT using the Modulo 11 algorithm.
 * @param rut The RUT string to validate (can contain dots and hyphens).
 * @returns true if valid, false otherwise.
 */
export function validateRut(rut: string): boolean {
  if (!rut) return false;

  const cleanRut = rut.replace(/[\.\-]/g, "");
  if (cleanRut.length < 2) return false;

  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toUpperCase();

  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i)) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDv = 11 - (sum % 11);
  const calculatedDv = expectedDv === 11 ? "0" : expectedDv === 10 ? "K" : expectedDv.toString();

  return dv === calculatedDv;
}

/**
 * Normalizes a Vehicle License Plate (Patente).
 * @param plate The plate string.
 * @returns Normalized plate (e.g., "AA-BB-12" or "BB-CC-12").
 */
export function normalizePlate(plate: string): string {
  if (!plate) return "";

  // Remove non-alphanumeric characters and uppercase
  const clean = plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  // New Format (4 letters, 2 numbers): BB-CC-12
  if (clean.length === 6 && /^[A-Z]{4}\d{2}$/.test(clean)) {
    return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4)}`;
  }

  // Old Format (2 letters, 4 numbers): AA-12-34 -> AA-1234 usually or AA-12-34
  // Standard format often used is AA-BB-12 (which is 4 letters 2 numbers)
  // Or AA-1234 (2 letters 4 numbers)

  if (clean.length === 6 && /^[A-Z]{2}\d{4}$/.test(clean)) {
     return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4)}`;
  }

  // Return cleaned if no standard format matches (could be moto, etc.)
  return clean;
}

/**
 * Calculates the month for the Technical Revision (PRT) based on the license plate.
 * @param plate The license plate.
 * @returns The name of the month (in Spanish) or "Desconocido".
 */
export function getPRTMonth(plate: string): string {
  const clean = plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (clean.length < 1) return "Desconocido";

  const lastDigitChar = clean.slice(-1);
  const lastDigit = parseInt(lastDigitChar);

  // If it ends in a letter, logic is different (usually mapped to numbers),
  // but for simplicity assuming standard cars end in number usually or we map them.
  // Current logic for non-catalytic/catalytic etc varies.
  // Simplified logic for Catalytic vehicles (Light vehicles):

  if (isNaN(lastDigit)) {
    // Handling new plates ending in letters is complex and depends on region/type,
    // sticking to last numerical digit found or simplified.
    // Actually, newer plates (BB-CC-12) end in a number.
    return "Desconocido";
  }

  // Calendario PRT Automóviles Particulares (Typical)
  // 9: Enero
  // 0: Febrero
  // 1: Abril
  // 2: Mayo
  // 3: Junio
  // 4: Julio
  // 5: Agosto
  // 6: Septiembre
  // 7: Octubre
  // 8: Noviembre
  // Diciembre/Marzo usually none or leftovers.

  switch (lastDigit) {
    case 9: return "Enero";
    case 0: return "Febrero";
    case 1: return "Abril";
    case 2: return "Mayo";
    case 3: return "Junio";
    case 4: return "Julio";
    case 5: return "Agosto";
    case 6: return "Septiembre";
    case 7: return "Octubre";
    case 8: return "Noviembre";
    default: return "Desconocido";
  }
}
