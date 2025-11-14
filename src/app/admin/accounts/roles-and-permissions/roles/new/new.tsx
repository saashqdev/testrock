"use client";

import { useRouter } from "next/navigation";
import RoleForm from "@/components/core/roles/RoleForm";
import { PermissionsWithRolesDto } from "@/db/models/permissions/PermissionsModel";

type AdminNewRoleRouteProps = {
  permissions: PermissionsWithRolesDto[];
};

export default function AdminNewRoleRoute({ permissions }: AdminNewRoleRouteProps) {
  const router = useRouter();
  function goBack() {
    router.push("/admin/accounts/roles-and-permissions/roles");
  }
  return <RoleForm permissions={permissions} onCancel={goBack} />;
}
