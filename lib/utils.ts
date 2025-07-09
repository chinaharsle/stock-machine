import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format specification labels for display
 */
export function formatSpecificationLabel(key: string): string {
  const labelMap: Record<string, string> = {
    bendingTonnage: "Bending Tonnage",
    bendingLength: "Bending Length",
    operatingSystem: "Operating System",
    backgaugeAxis: "Backgauge Axis"
  };
  return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Format production date for display
 */
export function formatProductionDate(date: string): string {
  const prodDate = new Date(date);
  return prodDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
