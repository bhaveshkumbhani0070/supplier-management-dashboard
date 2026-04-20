import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  createSupplier,
  deleteSupplier,
  getSupplierById,
  listSuppliers,
  updateSupplier,
} from "@/store/suppliers-db";
import type {
  Supplier,
  SupplierFormValues,
  SuppliersListResponse,
  SuppliersQueryParams,
} from "@/types/supplier";

interface ApiError {
  status: number;
  message: string;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      status: 400,
      message: error.message,
    };
  }

  return {
    status: 500,
    message: "Something went wrong.",
  };
}

async function mockDelay() {
  await new Promise((resolve) => {
    setTimeout(resolve, 220);
  });
}

export const suppliersApi = createApi({
  reducerPath: "suppliersApi",
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: ["Supplier"],
  endpoints: (builder) => ({
    getSuppliers: builder.query<SuppliersListResponse, SuppliersQueryParams>({
      async queryFn(params) {
        await mockDelay();

        try {
          return { data: listSuppliers(params) };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((supplier) => ({
                type: "Supplier" as const,
                id: supplier.id,
              })),
              { type: "Supplier" as const, id: "LIST" },
            ]
          : [{ type: "Supplier" as const, id: "LIST" }],
    }),
    getSupplierById: builder.query<Supplier, string>({
      async queryFn(id) {
        await mockDelay();

        try {
          const supplier = getSupplierById(id);

          if (!supplier) {
            throw new Error("Supplier not found.");
          }

          return { data: supplier };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Supplier", id }],
    }),
    createSupplier: builder.mutation<Supplier, SupplierFormValues>({
      async queryFn(payload) {
        await mockDelay();

        try {
          return { data: createSupplier(payload) };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      invalidatesTags: [{ type: "Supplier", id: "LIST" }],
    }),
    updateSupplier: builder.mutation<
      Supplier,
      { id: string; values: SupplierFormValues }
    >({
      async queryFn({ id, values }) {
        await mockDelay();

        try {
          return { data: updateSupplier(id, values) };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Supplier", id },
        { type: "Supplier", id: "LIST" },
      ],
    }),
    deleteSupplier: builder.mutation<Supplier, string>({
      async queryFn(id) {
        await mockDelay();

        try {
          return { data: deleteSupplier(id) };
        } catch (error) {
          return { error: toApiError(error) };
        }
      },
      invalidatesTags: (_result, _error, id) => [
        { type: "Supplier", id },
        { type: "Supplier", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useGetSupplierByIdQuery,
  useGetSuppliersQuery,
  useUpdateSupplierMutation,
} = suppliersApi;
