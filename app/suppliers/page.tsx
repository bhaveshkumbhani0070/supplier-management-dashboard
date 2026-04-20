import type { Metadata } from "next";
import { SuppliersPageClient } from "@/components/suppliers/suppliers-page-client";

export const metadata: Metadata = {
  title: "Suppliers",
  description: "Browse, filter, and manage supplier records.",
};

export default function SuppliersPage() {
  return <SuppliersPageClient />;
}
