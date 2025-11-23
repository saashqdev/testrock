"use client";

import { useTranslation } from "react-i18next";
import TableSimple from "@/components/ui/tables/TableSimple";
import { useState } from "react";
import InputSearch from "@/components/ui/input/InputSearch";
import DateUtils from "@/lib/shared/DateUtils";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";

interface AccountUsersViewProps {
  tenants: TenantWithDetailsDto[];
}

export default function AccountUsersView({ tenants }: AccountUsersViewProps) {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");

  const filteredItems = () => {
    if (!tenants) {
      return [];
    }
    return tenants.filter(
      (f: TenantWithDetailsDto) =>
        f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
        f.users.find(
          (x) =>
            x.user.email?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            x.user.firstName?.toString().toUpperCase().includes(searchInput.toUpperCase()) ||
            x.user.lastName?.toString().toUpperCase().includes(searchInput.toUpperCase())
        )
    );
  };

  return (
    <div className="space-y-2">
      <InputSearch value={searchInput} onChange={setSearchInput} />
      <TableSimple
        items={filteredItems()}
        headers={[
          {
            name: "tenant",
            title: t("models.tenant.object"),
            value: (i) => (
              <div className="max-w-sm truncate">
                <div className="flex items-center space-x-1 truncate font-medium text-foreground">{i.name}</div>

                <div className="text-xs text-muted-foreground">
                  <span>/{i.slug}</span>
                </div>
              </div>
            ),
          },
          {
            name: "types",
            title: t("shared.types"),
            value: (i) =>
              i.types.length === 0 ? <span className="text-muted-foreground">{t("shared.default")}</span> : i.types.map((f) => f.title).join(", "),
          },
          {
            name: "users",
            title: t("models.user.plural"),
            className: "max-w-xs truncate",
            value: (i) => i.users.map((f) => f.user.email).join(", "),
            href: (i) => `/admin/accounts/users?tenantId=${i.id}`,
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (i) => (
              <div className="flex flex-col">
                <div>{DateUtils.dateYMD(i.createdAt)}</div>
                <div className="text-xs">{DateUtils.dateAgo(i.createdAt)}</div>
              </div>
            ),
          },
        ]}
        actions={[
          {
            title: t("shared.setUserRoles"),
            onClickRoute: (_, item) => `${item.id}`,
          },
        ]}
      />
    </div>
  );
}
