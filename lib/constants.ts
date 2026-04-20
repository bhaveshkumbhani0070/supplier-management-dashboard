import type {
  Supplier,
  SupplierCountry,
  SupplierRegion,
  SupplierStatus,
} from "@/types/supplier";
import { SUPPLIER_COUNTRIES, SUPPLIER_STATUSES } from "@/types/supplier";

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export const COUNTRY_REGION_MAP: Record<SupplierCountry, SupplierRegion> = {
  "United States": "North America",
  Canada: "North America",
  Mexico: "North America",
  Brazil: "South America",
  "United Kingdom": "Europe",
  Germany: "Europe",
  France: "Europe",
  India: "Asia Pacific",
  China: "Asia Pacific",
  Japan: "Asia Pacific",
  Australia: "Asia Pacific",
  "United Arab Emirates": "Middle East",
};

export const REGION_BADGE_STYLES: Record<SupplierRegion, string> = {
  "North America":
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  "South America":
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  Europe:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  "Asia Pacific":
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  "Middle East":
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300",
};

export const STATUS_BADGE_STYLES: Record<SupplierStatus, string> = {
  ACTIVE:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  INACTIVE:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300",
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
};

export const COUNTRY_FILTER_OPTIONS = [
  { label: "All countries", value: "ALL" },
  ...SUPPLIER_COUNTRIES.map((country) => ({ label: country, value: country })),
] as const;

export const COUNTRY_FORM_OPTIONS = SUPPLIER_COUNTRIES.map((country) => ({
  label: country,
  value: country,
})) as ReadonlyArray<{ label: SupplierCountry; value: SupplierCountry }>;

export const STATUS_FILTER_OPTIONS = [
  { label: "All statuses", value: "ALL" },
  ...SUPPLIER_STATUSES.map((status) => ({
    label: formatStatusLabel(status),
    value: status,
  })),
] as const;

export const STATUS_FORM_OPTIONS = SUPPLIER_STATUSES.map((status) => ({
  label: formatStatusLabel(status),
  value: status,
})) as ReadonlyArray<{ label: string; value: SupplierStatus }>;

export function formatStatusLabel(status: SupplierStatus) {
  return `${status.slice(0, 1)}${status.slice(1).toLowerCase()}`;
}

export function getCountryRegion(country: SupplierCountry) {
  return COUNTRY_REGION_MAP[country];
}

export function getSupplierDisplayName(supplier: Supplier) {
  return `${supplier.companyName} (${supplier.contactPerson})`;
}
