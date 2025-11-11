"use client";

import RolesPageClient from "./RolesPageClient";
import { RoleWithPermissionsAndUsersDto } from "@/db/models/permissions/RolesModel";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";

interface ComponentProps {
  items: RoleWithPermissionsAndUsersDto[];
  filterableProperties: FilterablePropertyDto[];
}

export default function Component({ items, filterableProperties }: ComponentProps) {
  return <RolesPageClient items={items} filterableProperties={filterableProperties} paramId={undefined} />;
}
