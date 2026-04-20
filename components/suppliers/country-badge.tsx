import { Badge } from "@/components/ui/badge";
import { getCountryRegion, REGION_BADGE_STYLES } from "@/lib/constants";
import type { SupplierCountry } from "@/types/supplier";

export function CountryBadge({ country }: { country: SupplierCountry }) {
  const region = getCountryRegion(country);

  return (
    <Badge
      variant="outline"
      className={REGION_BADGE_STYLES[region]}
      title={region}
    >
      {country}
    </Badge>
  );
}
