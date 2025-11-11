"use client";

import { PermissionsWithRolesDto } from "@/db/models/permissions/PermissionsModel";
import PermissionsTable from "@/components/core/roles/PermissionsTable";

interface PermissionsComponentProps {
  items: PermissionsWithRolesDto[];
}

export default function PermissionsComponent({ items }: PermissionsComponentProps) {
  return (
    <div>
      <PermissionsTable items={items} canCreate={false} canUpdate={true} />
    </div>
  );
}
