"use client";

import { useRouter } from "next/navigation";
import PermissionForm from "@/components/core/roles/PermissionForm";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";

type NewPermissionViewProps = {
  roles: RoleWithPermissionsDto[];
};

export default function NewPermissionView({ roles }: NewPermissionViewProps) {
  const router = useRouter();
  function goBack() {
    router.push("/admin/accounts/roles-and-permissions/permissions");
  }
  return <PermissionForm roles={roles} onCancel={goBack} />;
}
