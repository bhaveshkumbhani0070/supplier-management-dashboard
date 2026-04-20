"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { COUNTRY_FORM_OPTIONS, STATUS_FORM_OPTIONS } from "@/lib/constants";
import {
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
} from "@/store/suppliers-api";
import type { Supplier, SupplierFormValues } from "@/types/supplier";
import { SUPPLIER_COUNTRIES, SUPPLIER_STATUSES } from "@/types/supplier";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const supplierSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters."),
  contactPerson: z
    .string()
    .trim()
    .min(2, "Contact person must be at least 2 characters."),
  email: z.email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .refine((value) => !value || /^\+[1-9]\d{7,14}$/.test(value), {
      message: "Use international format, for example +14165550123.",
    }),
  country: z.enum(SUPPLIER_COUNTRIES, {
    error: "Country is required.",
  }),
  status: z.enum(SUPPLIER_STATUSES, {
    error: "Status is required.",
  }),
  notes: z.string().trim(),
});

const emptyValues: SupplierFormValues = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  country: "United States",
  status: "ACTIVE",
  notes: "",
};

type SupplierFormSchemaValues = z.infer<typeof supplierSchema>;

type SupplierDialogMode = "create" | "edit" | "view";

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: SupplierDialogMode;
  supplier?: Supplier;
  isLoading?: boolean;
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  mode,
  supplier,
  isLoading = false,
}: SupplierFormDialogProps) {
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation();
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();

  const form = useForm<SupplierFormSchemaValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: emptyValues,
  });

  const isSubmitting = isCreating || isUpdating;
  const isReadOnly = mode === "view";

  useEffect(() => {
    if (!open) {
      form.reset(emptyValues);
      return;
    }

    if (supplier) {
      form.reset({
        companyName: supplier.companyName,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        country: supplier.country,
        status: supplier.status,
        notes: supplier.notes,
      });
      return;
    }

    form.reset(emptyValues);
  }, [form, open, supplier]);

  async function onSubmit(values: SupplierFormSchemaValues) {
    if (isReadOnly) {
      onOpenChange(false);
      return;
    }

    if (mode === "edit" && supplier) {
      await updateSupplier({ id: supplier.id, values }).unwrap();
      toast.success("Supplier updated");
      onOpenChange(false);
      return;
    }

    await createSupplier(values).unwrap();
    toast.success("Supplier created");
    onOpenChange(false);
  }

  const title =
    mode === "create"
      ? "Add supplier"
      : mode === "edit"
        ? "Edit supplier"
        : "Supplier details";
  const description =
    mode === "create"
      ? "Create a new supplier record."
      : mode === "edit"
        ? "Update the selected supplier information."
        : "Review the supplier information below.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-60 items-center justify-center rounded-lg border border-dashed">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((values) => {
              void onSubmit(values);
            })}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  disabled={isReadOnly || isSubmitting}
                  {...form.register("companyName")}
                />
                {form.formState.errors.companyName ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.companyName.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  disabled={isReadOnly || isSubmitting}
                  {...form.register("contactPerson")}
                />
                {form.formState.errors.contactPerson ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.contactPerson.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  disabled={isReadOnly || isSubmitting}
                  type="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  disabled={isReadOnly || isSubmitting}
                  placeholder="+14165550123"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label>Country</Label>
                <Controller
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <Select
                      disabled={isReadOnly || isSubmitting}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_FORM_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.country ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.country.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      disabled={isReadOnly || isSubmitting}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_FORM_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.status ? (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.status.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                disabled={isReadOnly || isSubmitting}
                placeholder="Add supplier-specific notes, agreements, or reminders."
                {...form.register("notes")}
              />
              {form.formState.errors.notes ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.notes.message}
                </p>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                disabled={isSubmitting}
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {isReadOnly ? "Close" : "Cancel"}
              </Button>
              {!isReadOnly ? (
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="animate-spin" />
                      Saving...
                    </>
                  ) : mode === "edit" ? (
                    "Update supplier"
                  ) : (
                    "Create supplier"
                  )}
                </Button>
              ) : null}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
