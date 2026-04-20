export const SUPPLIER_STATUSES = ["ACTIVE", "INACTIVE", "PENDING"] as const;

export const SUPPLIER_COUNTRIES = [
  "United States",
  "Canada",
  "Mexico",
  "Brazil",
  "United Kingdom",
  "Germany",
  "France",
  "India",
  "China",
  "Japan",
  "Australia",
  "United Arab Emirates",
] as const;

export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number];
export type SupplierCountry = (typeof SUPPLIER_COUNTRIES)[number];
export type SupplierRegion =
  | "North America"
  | "South America"
  | "Europe"
  | "Asia Pacific"
  | "Middle East";

export type SupplierSortColumn = "companyName" | "productCount";
export type SortDirection = "asc" | "desc";

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: SupplierCountry;
  productCount: number;
  status: SupplierStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierFormValues {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: SupplierCountry;
  status: SupplierStatus;
  notes: string;
}

export interface SuppliersQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: SupplierStatus;
  country?: SupplierCountry;
  sortBy?: SupplierSortColumn;
  sortDirection?: SortDirection;
}

export interface SuppliersListMeta {
  page: number;
  limit: number;
  total: number;
  totalAll: number;
  totalPages: number;
}

export interface SuppliersListResponse {
  data: Supplier[];
  meta: SuppliersListMeta;
}
