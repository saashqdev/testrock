"use client";

import { useRouter } from "next/navigation";
import PermissionForm from "@/components/core/roles/PermissionForm";
import { useAdminData } from "@/lib/state/useAdminData";
import { PermissionsWithRolesDto } from "@/db/models/permissions/PermissionsModel";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

interface PermissionEditViewProps {
  item: PermissionsWithRolesDto;
  roles: RoleWithPermissionsDto[];
}

export default function PermissionEditView({ item, roles }: PermissionEditViewProps) {
  const adminData = useAdminData();
  const router = useRouter();

  function goBack() {
    router.push("/admin/accounts/roles-and-permissions/permissions");
  }

  return (
    <PermissionForm
      item={item}
      roles={roles}
      onCancel={goBack}
      canUpdate={getUserHasPermission(adminData, "admin.roles.update")}
      canDelete={getUserHasPermission(adminData, "admin.roles.delete")}
    />
  );
}
