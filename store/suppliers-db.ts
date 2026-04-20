import { mockSuppliers } from "@/lib/mock-suppliers";
import type {
  SortDirection,
  Supplier,
  SupplierFormValues,
  SupplierSortColumn,
  SuppliersListResponse,
  SuppliersQueryParams,
} from "@/types/supplier";

let suppliersDb = [...mockSuppliers];

function compareValues(
  left: Supplier,
  right: Supplier,
  sortBy: SupplierSortColumn,
  direction: SortDirection,
) {
  const factor = direction === "asc" ? 1 : -1;

  if (sortBy === "productCount") {
    return (left.productCount - right.productCount) * factor;
  }

  return left.companyName.localeCompare(right.companyName) * factor;
}

function normalizeSearch(search?: string) {
  return search?.trim().toLowerCase() ?? "";
}

function getNextId() {
  return `sup-${String(suppliersDb.length + 1).padStart(3, "0")}`;
}

function buildTimestamp(offset: number) {
  return new Date(Date.now() + offset).toISOString();
}

export function listSuppliers(params: SuppliersQueryParams): SuppliersListResponse {
  const search = normalizeSearch(params.search);

  const filtered = suppliersDb
    .filter((supplier) => {
      if (
        search &&
        !supplier.companyName.toLowerCase().includes(search) &&
        !supplier.contactPerson.toLowerCase().includes(search)
      ) {
        return false;
      }

      if (params.status && supplier.status !== params.status) {
        return false;
      }

      if (params.country && supplier.country !== params.country) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      if (!params.sortBy || !params.sortDirection) {
        return left.companyName.localeCompare(right.companyName);
      }

      return compareValues(left, right, params.sortBy, params.sortDirection);
    });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const safePage = Math.min(Math.max(params.page, 1), totalPages);
  const startIndex = (safePage - 1) * params.limit;
  const endIndex = startIndex + params.limit;

  return {
    data: filtered.slice(startIndex, endIndex),
    meta: {
      page: safePage,
      limit: params.limit,
      total,
      totalAll: suppliersDb.length,
      totalPages,
    },
  };
}

export function getSupplierById(id: string) {
  return suppliersDb.find((supplier) => supplier.id === id);
}

export function createSupplier(values: SupplierFormValues) {
  const timestamp = buildTimestamp(suppliersDb.length);
  const createdSupplier: Supplier = {
    id: getNextId(),
    companyName: values.companyName.trim(),
    contactPerson: values.contactPerson.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    country: values.country,
    status: values.status,
    notes: values.notes.trim(),
    productCount: 12 + ((suppliersDb.length * 17) % 130),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  suppliersDb = [createdSupplier, ...suppliersDb];
  return createdSupplier;
}

export function updateSupplier(id: string, values: SupplierFormValues) {
  const existingSupplier = getSupplierById(id);

  if (!existingSupplier) {
    throw new Error("Supplier not found.");
  }

  const updatedSupplier: Supplier = {
    ...existingSupplier,
    companyName: values.companyName.trim(),
    contactPerson: values.contactPerson.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    country: values.country,
    status: values.status,
    notes: values.notes.trim(),
    updatedAt: buildTimestamp(0),
  };

  suppliersDb = suppliersDb.map((supplier) =>
    supplier.id === id ? updatedSupplier : supplier,
  );

  return updatedSupplier;
}

export function deleteSupplier(id: string) {
  const existingSupplier = getSupplierById(id);

  if (!existingSupplier) {
    throw new Error("Supplier not found.");
  }

  suppliersDb = suppliersDb.filter((supplier) => supplier.id !== id);
  return existingSupplier;
}
