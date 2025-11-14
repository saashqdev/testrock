"use client";

import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { UserWithDetailsDto, UserWithRolesDto } from "@/db/models/accounts/UsersModel";
import UserRolesTable from "@/components/core/roles/UserRolesTable";
import { useEffect, useState, useTransition } from "react";
import InputSearch from "@/components/ui/input/InputSearch";
import { useAdminData } from "@/lib/state/useAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

type LoaderData = {
  title: string;
  items: UserWithDetailsDto[];
  roles: RoleWithPermissionsDto[];
};

interface AdminUsersClientProps {
  data: LoaderData;
  updateUserRole: (formData: FormData) => Promise<void>;
}

export default function AdminUsersClient({ data, updateUserRole }: AdminUsersClientProps) {
  const adminData = useAdminData();
  const [items, setItems] = useState(data.items);
  const [searchInput, setSearchInput] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(data.items);
  }, [data]);

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter(
      (f: UserWithDetailsDto) =>
        f.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.tenants.find((f) => f.tenant.name.toUpperCase().includes(searchInput.toUpperCase())) ||
        f.roles.find(
          (f) => f.role.name.toUpperCase().includes(searchInput.toUpperCase()) || f.role.description.toUpperCase().includes(searchInput.toUpperCase())
        )
    );
  };

  function onChange(item: UserWithRolesDto, role: RoleWithPermissionsDto, add: any) {
    const form = new FormData();
    form.set("action", "edit");
    form.set("user-id", item.id);
    form.set("role-id", role.id);
    form.set("add", add ? "true" : "false");
    
    startTransition(async () => {
      await updateUserRole(form);
    });
  }

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} onChange={setSearchInput} />
      <UserRolesTable 
        items={filteredItems()} 
        roles={data.roles} 
        onChange={onChange} 
        disabled={!getUserHasPermission(adminData, "admin.roles.set") || isPending} 
      />
    </div>
  );
}
