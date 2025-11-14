"use client";

import { useEffect, useState, useActionState } from "react";
import { useParams } from "next/navigation";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { UserWithRolesDto } from "@/db/models/accounts/UsersModel";
import UserRolesTable from "@/components/core/roles/UserRolesTable";
import { Tenant } from "@prisma/client";
import InputSearch from "@/components/ui/input/InputSearch";
import BreadcrumbSimple from "@/components/ui/breadcrumbs/BreadcrumbSimple";
import { useAdminData } from "@/lib/state/useAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

type LoaderData = {
  title: string;
  tenant: Tenant;
  items: UserWithRolesDto[];
  roles: RoleWithPermissionsDto[];
};

type ActionData = {
  error?: string;
};

export default function AdminAccountUsersFromTenantClient({
  data,
  action,
}: {
  data: LoaderData;
  action: (prev: any, formData: FormData) => Promise<ActionData>;
}) {
  const adminData = useAdminData();
  const [items, setItems] = useState(data.items);
  const params = useParams();
  const [searchInput, setSearchInput] = useState("");
  const [actionData, formAction, isPending] = useActionState<ActionData, FormData>(action, {});

  useEffect(() => {
    setItems(data.items);
  }, [actionData, data]);

  const filteredItems = () => {
    if (!items) {
      return [];
    }
    return items.filter(
      (f: UserWithRolesDto) =>
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
    formAction(form);
  }

  return (
    <div className="space-y-2">
      <BreadcrumbSimple
        home="/admin"
        menu={[
          {
            title: "App Users",
            routePath: "/admin/accounts/roles-and-permissions/account-users",
          },
          {
            title: data.tenant.name,
            routePath: "/admin/accounts/roles-and-permissions/account-users/" + data.tenant.id,
          },
        ]}
      />
      <InputSearch value={searchInput} onChange={setSearchInput} />
      <UserRolesTable
        items={filteredItems()}
        roles={data.roles}
        onChange={onChange}
        tenantId={params.account as string ?? ""}
        disabled={!getUserHasPermission(adminData, "admin.roles.set") || isPending}
      />
    </div>
  );
}
