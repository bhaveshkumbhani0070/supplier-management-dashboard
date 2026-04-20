"use client";

import {
  useDeferredValue,
  useEffect,
  useState,
  startTransition,
} from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  COUNTRY_FILTER_OPTIONS,
  PAGE_SIZE_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "@/lib/constants";
import { useTableFilters } from "@/hooks/use-table-filters";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { useTableSorting } from "@/hooks/use-table-sorting";
import {
  useDeleteSupplierMutation,
  useGetSupplierByIdQuery,
  useGetSuppliersQuery,
} from "@/store/suppliers-api";
import type { Supplier, SupplierSortColumn } from "@/types/supplier";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CountryBadge } from "@/components/suppliers/country-badge";
import { DeleteSuppliersDialog } from "@/components/suppliers/delete-suppliers-dialog";
import { EmptyState } from "@/components/suppliers/empty-state";
import { StatusBadge } from "@/components/suppliers/status-badge";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form-dialog";

type SupplierFilterState = {
  search: string;
  status: "ALL" | Supplier["status"];
  country: "ALL" | Supplier["country"];
};

type SupplierDialogMode = "create" | "edit" | "view";

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc" | null;
}) {
  if (!active || !direction) {
    return <ArrowUpDown className="size-4" />;
  }

  return direction === "asc" ? (
    <ArrowUp className="size-4" />
  ) : (
    <ArrowDown className="size-4" />
  );
}

export function SuppliersPageClient() {
  const pagination = useTablePagination({ initialLimit: 10 });
  const filters = useTableFilters<SupplierFilterState>({
    search: "",
    status: "ALL",
    country: "ALL",
  });
  const sorting = useTableSorting<SupplierSortColumn>({});
  const deferredSearch = useDeferredValue(filters.filters.search);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<SupplierDialogMode>("create");
  const [activeSupplierId, setActiveSupplierId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const query = useGetSuppliersQuery({
    page: pagination.page,
    limit: pagination.limit,
    search: deferredSearch || undefined,
    status: filters.filters.status === "ALL" ? undefined : filters.filters.status,
    country:
      filters.filters.country === "ALL" ? undefined : filters.filters.country,
    sortBy: sorting.sortBy ?? undefined,
    sortDirection: sorting.direction ?? undefined,
  });

  const supplierQuery = useGetSupplierByIdQuery(activeSupplierId ?? "", {
    skip: !activeSupplierId || !dialogOpen,
  });

  const [deleteSupplier, { isLoading: isDeletingSupplier }] =
    useDeleteSupplierMutation();

  useEffect(() => {
    pagination.setTotal(query.data?.meta.total ?? 0);
  }, [pagination, query.data?.meta.total]);

  useEffect(() => {
    if (!query.data) {
      return;
    }

    if (pagination.page > query.data.meta.totalPages) {
      pagination.setPage(query.data.meta.totalPages);
    }
  }, [pagination, pagination.page, query.data]);

  useEffect(() => {
    setRowSelection({});
  }, [
    pagination.page,
    pagination.limit,
    deferredSearch,
    filters.filters.status,
    filters.filters.country,
    sorting.sortBy,
    sorting.direction,
  ]);

  const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
  const currentData = query.data?.data ?? [];
  const totalAll = query.data?.meta.totalAll ?? 0;
  const hasNoSuppliers = !query.isFetching && totalAll === 0;
  const hasNoResults = !query.isFetching && totalAll > 0 && currentData.length === 0;

  async function handleDeleteOne(id: string) {
    const supplier = query.data?.data.find((item) => item.id === id) ?? supplierQuery.data;

    await deleteSupplier(id).unwrap();
    toast.success("Supplier deleted");
    setDeleteDialogOpen(false);
    setActiveSupplierId(null);

    if (supplier && rowSelection[supplier.id]) {
      setRowSelection((currentSelection) => {
        const nextSelection = { ...currentSelection };
        delete nextSelection[supplier.id];
        return nextSelection;
      });
    }
  }

  async function handleBulkDelete() {
    setBulkDeleteLoading(true);

    try {
      await Promise.all(selectedIds.map((id) => deleteSupplier(id).unwrap()));
      toast.success(`${selectedIds.length} suppliers deleted`);
      setRowSelection({});
      setBulkDeleteDialogOpen(false);
    } finally {
      setBulkDeleteLoading(false);
    }
  }

  function openDialog(mode: SupplierDialogMode, supplierId?: string) {
    setDialogMode(mode);
    setActiveSupplierId(supplierId ?? null);
    setDialogOpen(true);
  }

  function handleFilterChange<K extends keyof SupplierFilterState>(
    key: K,
    value: SupplierFilterState[K],
  ) {
    startTransition(() => {
      filters.setFilter(key, value);
      pagination.setPage(1);
    });
  }

  function resetFilters() {
    startTransition(() => {
      filters.resetFilters();
      sorting.resetSorting();
      pagination.setPage(1);
    });
  }

  function toggleSort(column: SupplierSortColumn) {
    startTransition(() => {
      sorting.toggleSort(column);
      pagination.setPage(1);
    });
  }

  const columns: ColumnDef<Supplier>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all rows"
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select ${row.original.companyName}`}
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        />
      ),
      enableSorting: false,
      size: 36,
    },
    {
      accessorKey: "companyName",
      header: () => (
        <button
          className="inline-flex items-center gap-2 font-medium"
          onClick={() => toggleSort("companyName")}
          type="button"
        >
          Company Name
          <SortIcon
            active={sorting.sortBy === "companyName"}
            direction={sorting.direction}
          />
        </button>
      ),
      cell: ({ row }) => (
        <div className="min-w-44">
          <p className="font-medium">{row.original.companyName}</p>
          <p className="text-xs text-muted-foreground">{row.original.notes}</p>
        </div>
      ),
    },
    {
      accessorKey: "contactPerson",
      header: "Contact Person",
      cell: ({ row }) => row.original.contactPerson,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <a
          className="text-primary underline-offset-4 hover:underline"
          href={`mailto:${row.original.email}`}
        >
          {row.original.email}
        </a>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone,
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => <CountryBadge country={row.original.country} />,
    },
    {
      accessorKey: "productCount",
      header: () => (
        <button
          className="inline-flex items-center gap-2 font-medium"
          onClick={() => toggleSort("productCount")}
          type="button"
        >
          Product Count
          <SortIcon
            active={sorting.sortBy === "productCount"}
            direction={sorting.direction}
          />
        </button>
      ),
      cell: ({ row }) => row.original.productCount,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Open row actions" size="icon-sm" variant="ghost">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDialog("view", row.original.id)}>
              <Eye />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog("edit", row.original.id)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setActiveSupplierId(row.original.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: currentData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    manualPagination: true,
    pageCount: query.data?.meta.totalPages ?? 1,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  return (
    <main className=" py-8 sm:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-3xl border bg-background/85 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Supplier Operations
              </p>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Supplier Management Dashboard
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Monitor supplier status, maintain contact details, and manage
                  mock CRUD operations through RTK Query.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border bg-muted/40 px-4 py-3 text-sm">
                <p className="text-muted-foreground">Total suppliers</p>
                <p className="text-xl font-semibold">{totalAll}</p>
              </div>
              <Button onClick={() => openDialog("create")}>
                <Plus />
                Add Supplier
              </Button>
            </div>
          </div>
        </section>

        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="rounded-3xl border bg-background/85 pb-5 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="text-xl">Supplier list</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search, filter, sort, and take action on supplier records.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedIds.length > 0 ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                  >
                    <Trash2 />
                    Delete selected ({selectedIds.length})
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  Reset filters
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search by company or contact person"
                  value={filters.filters.search}
                  onChange={(event) =>
                    handleFilterChange("search", event.target.value)
                  }
                />
              </div>
              <Select
                value={filters.filters.status}
                onValueChange={(value) =>
                  handleFilterChange("status", value as SupplierFilterState["status"])
                }
              >
                <SelectTrigger className="w-full md:w-52">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.filters.country}
                onValueChange={(value) =>
                  handleFilterChange(
                    "country",
                    value as SupplierFilterState["country"],
                  )
                }
              >
                <SelectTrigger className="w-full md:w-56">
                  <SelectValue placeholder="Filter by country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="mt-4 rounded-3xl border bg-background/85 p-0 backdrop-blur">
            {hasNoSuppliers ? (
              <div className="p-6">
                <EmptyState
                  actionLabel="Add Supplier"
                  description="Create your first supplier to start managing partnerships and contact details."
                  icon={Building2}
                  onAction={() => openDialog("create")}
                  title="No suppliers yet"
                />
              </div>
            ) : hasNoResults ? (
              <div className="p-6">
                <EmptyState
                  actionLabel="Reset filters"
                  description="Try adjusting your search, status, or country filters to broaden the result set."
                  icon={Search}
                  onAction={resetFilters}
                  title="No results match your filters"
                />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {query.isFetching ? (
                      <TableRow>
                        <TableCell
                          className="h-28 text-center text-muted-foreground"
                          colSpan={columns.length}
                        >
                          Loading suppliers...
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="flex flex-col gap-4 border-t px-6 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {currentData.length} of {query.data?.meta.total ?? 0} filtered
                    suppliers
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rows per page</span>
                      <Select
                        value={String(pagination.limit)}
                        onValueChange={(value) => pagination.setLimit(Number(value))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_SIZE_OPTIONS.map((pageSize) => (
                            <SelectItem key={pageSize} value={String(pageSize)}>
                              {pageSize}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        disabled={pagination.page <= 1 || query.isFetching}
                        size="icon-sm"
                        variant="outline"
                        onClick={() => pagination.setPage(pagination.page - 1)}
                      >
                        <ChevronLeft />
                      </Button>
                      <span className="min-w-28 text-center text-sm text-muted-foreground">
                        Page {query.data?.meta.page ?? pagination.page} of{" "}
                        {query.data?.meta.totalPages ?? pagination.totalPages}
                      </span>
                      <Button
                        disabled={
                          query.isFetching ||
                          pagination.page >= (query.data?.meta.totalPages ?? 1)
                        }
                        size="icon-sm"
                        variant="outline"
                        onClick={() => pagination.setPage(pagination.page + 1)}
                      >
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <SupplierFormDialog
        isLoading={supplierQuery.isFetching}
        mode={dialogMode}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={supplierQuery.data}
      />

      <DeleteSuppliersDialog
        companyName={supplierQuery.data?.companyName}
        isDeleting={isDeletingSupplier}
        open={deleteDialogOpen}
        onConfirm={() => handleDeleteOne(activeSupplierId ?? "")}
        onOpenChange={setDeleteDialogOpen}
      />

      <DeleteSuppliersDialog
        count={selectedIds.length}
        isDeleting={bulkDeleteLoading}
        open={bulkDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        onOpenChange={setBulkDeleteDialogOpen}
      />
    </main>
  );
}
