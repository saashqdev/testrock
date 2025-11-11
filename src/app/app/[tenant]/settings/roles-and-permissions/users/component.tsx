"use client";

import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { UserWithRolesDto } from "@/db/models/accounts/UsersModel";
import UserRolesTable from "@/components/core/roles/UserRolesTable";
import { useEffect, useState, useActionState } from "react";
import InputSearch from "@/components/ui/input/InputSearch";
import { useAppData } from "@/lib/state/useAppData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { actionRolesAndPermissionsUsers } from "./page";

type ComponentProps = {
  data: {
    items: UserWithRolesDto[];
    roles: RoleWithPermissionsDto[];
  };
};

export default function Component({ data }: ComponentProps) {
  const appData = useAppData();
  const [items, setItems] = useState(data.items);
  const [searchInput, setSearchInput] = useState("");
  const [actionData, action, pending] = useActionState(actionRolesAndPermissionsUsers, null);

  useEffect(() => {
    setItems(data.items);
  }, [data]);

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter(
      (f) =>
        f.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
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
    action(form);
  }

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} onChange={setSearchInput} />

      <UserRolesTable
        items={filteredItems()}
        roles={data.roles}
        onChange={onChange}
        tenantId={appData.currentTenant.id}
        disabled={!getUserHasPermission(appData, "app.settings.roles.set")}
      />
    </div>
  );
}
