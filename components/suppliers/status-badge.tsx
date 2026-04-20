import { STATUS_BADGE_STYLES, formatStatusLabel } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import type { SupplierStatus } from "@/types/supplier";

export function StatusBadge({ status }: { status: SupplierStatus }) {
  return (
    <Badge variant="outline" className={STATUS_BADGE_STYLES[status]}>
      {formatStatusLabel(status)}
    </Badge>
  );
}
