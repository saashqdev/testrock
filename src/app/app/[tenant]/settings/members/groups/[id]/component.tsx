"use client";

import { GroupWithDetailsDto } from "@/db/models/permissions/GroupsModel";
import { TenantUserWithUserDto } from "@/db/models/accounts/TenantsModel";
import GroupForm from "@/components/core/roles/GroupForm";

interface EditGroupComponentProps {
  item: GroupWithDetailsDto;
  tenantUsers: TenantUserWithUserDto[];
  params: { tenant: string; id: string };
}

export default function EditGroupComponent({ item, tenantUsers, params }: EditGroupComponentProps) {
  return <GroupForm item={item} allUsers={tenantUsers} />;
}
