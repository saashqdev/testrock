"use client";

import { useRouter } from "next/navigation";
import RoleForm from "@/components/core/roles/RoleForm";
import { useAdminData } from "@/lib/state/useAdminData";
import { PermissionsWithRolesDto } from "@/db/models/permissions/PermissionsModel";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

interface RoleEditViewProps {
  item: RoleWithPermissionsDto;
  permissions: PermissionsWithRolesDto[];
}

export default function RoleEditView({ item, permissions }: RoleEditViewProps) {
  const adminData = useAdminData();
  const router = useRouter();

  function goBack() {
    router.push("/admin/accounts/roles-and-permissions/roles");
  }

  return (
    <RoleForm
      item={item}
      permissions={permissions}
      onCancel={goBack}
      canUpdate={getUserHasPermission(adminData, "admin.roles.update")}
      canDelete={getUserHasPermission(adminData, "admin.roles.delete")}
    />
  );
}
