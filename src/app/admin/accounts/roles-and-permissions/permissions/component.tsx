"use client";

import PermissionsTable from "@/modules/permissions/components/PermissionsTable";
import { PermissionsWithRolesDto } from "@/db/models/permissions/PermissionsModel";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";

interface ComponentProps {
  items: PermissionsWithRolesDto[];
  filterableProperties: FilterablePropertyDto[];
}

export default function Component({ items, filterableProperties }: ComponentProps) {
  return <PermissionsTable items={items} canUpdate={true} />;
}
