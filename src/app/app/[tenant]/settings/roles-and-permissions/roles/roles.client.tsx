"use client";

import { RoleWithPermissionsAndUsersDto } from "@/db/models/permissions/RolesModel";
import RolesTable from "@/modules/permissions/components/RolesTable";

interface RolesClientProps {
  items: RoleWithPermissionsAndUsersDto[];
}

export default function RolesClient({ items }: RolesClientProps) {
  return <RolesTable items={items} canUpdate={true} tenantId={null} />;
}
