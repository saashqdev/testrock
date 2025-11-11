"use client";

import { TenantUserWithUserDto } from "@/db/models/accounts/TenantsModel";
import GroupForm from "@/components/core/roles/GroupForm";

interface NewGroupComponentProps {
  tenantUsers: TenantUserWithUserDto[];
  params: { tenant: string };
}

export default function NewGroupComponent({ tenantUsers, params }: NewGroupComponentProps) {
  return <GroupForm allUsers={tenantUsers} />;
}
