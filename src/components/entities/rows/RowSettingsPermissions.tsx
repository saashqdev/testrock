"use client";

import { RowPermission, Tenant } from "@prisma/client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "@/lib/enums/shared/Colors";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import InputSelect from "@/components/ui/input/InputSelect";
import InputSelector from "@/components/ui/input/InputSelector";
import { useAppData } from "@/lib/state/useAppData";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { useRootData } from "@/lib/state/useRootData";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { UserWithDetailsDto } from "@/db/models/accounts/UsersModel";

type PermissionDto = {
  tenantId: string | null;
  userId: string | null;
  groupId: string | null;
  roleId: string | null;
};
export default function RowSettingsPermissions({
  item,
  items,
  tenants,
  users,
  withTitle,
}: {
  item: RowWithDetailsDto;
  items: RowPermission[];
  tenants: Tenant[];
  users: UserWithDetailsDto[];
  withTitle?: boolean;
}) {
  const { t } = useTranslation();
  const rootData = useRootData();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appOrAdminData = useAppOrAdminData();

  const [adding, setAdding] = useState(false);

  function getTypeOrder(permission: PermissionDto) {
    if (permission.tenantId) {
      return 1;
    } else if (permission.userId) {
      return 2;
    } else if (permission.roleId) {
      return 3;
    } else if (permission.groupId) {
      return 4;
    }
    return 0;
  }
  function getName(permission: PermissionDto) {
    if (permission.tenantId) {
      return tenants.find((x) => x.id === permission.tenantId)?.name;
    } else if (permission.userId) {
      return users.find((x) => x.id === permission.userId)?.email;
    } else if (permission.roleId) {
      return appOrAdminData?.allRoles.find((x) => x.id === permission.roleId)?.name;
    } else if (permission.groupId) {
      return appOrAdminData?.myGroups.find((x) => x.id === permission.groupId)?.name;
    }
    return "";
  }
  function getTypes() {
    const options: { name: string; value: string; color: Colors }[] = [];
    if (users.length > 0) {
      options.push({ name: t("models.user.object") + "...", value: "user", color: Colors.BLUE });
    }
    if (tenants.length > 0) {
      options.push({ name: t("models.tenant.users") + "...", value: "tenant", color: Colors.GREEN });
    }
    if ((appOrAdminData?.myGroups.length ?? 0) > 0 && rootData.featureFlags?.includes("row-groups")) {
      options.push({ name: t("models.group.object") + "...", value: "group", color: Colors.INDIGO });
    }
    if ((appOrAdminData?.allRoles.length ?? 0) > 0) {
      options.push({ name: t("models.role.object") + "...", value: "role", color: Colors.RED });
    }
    return options;
  }

  function sortedItems() {
    return items.sort((a, b) => {
      const aOrder = getTypeOrder(a);
      const bOrder = getTypeOrder(b);
      if (aOrder === bOrder) {
        return getName(a)?.localeCompare(getName(b) ?? "") ?? 0;
      }
      return aOrder - bOrder;
    });
  }
  return (
    <div className="space-y-2 text-foreground">
      {withTitle && <div className="text-sm font-medium text-foreground">{t("shared.shareWith")}...</div>}
      {(items.length > 0 || item.createdByUser) && (
        <ul className="divide-y divide-border rounded-md border border-dashed border-border bg-secondary/70">
          {item.createdByUser && (
            <div className="flex justify-between space-x-2 truncate px-2 py-2">
              <div className="flex w-full space-x-2 truncate">
                <div className="flex flex-col truncate">
                  <div className="text-xs font-bold uppercase text-muted-foreground">
                    <span>Creator</span>
                  </div>
                  <div className="truncate text-sm text-foreground">{item.createdByUser.email}</div>
                </div>
              </div>
              <InputSelect className="w-32 shrink-0" disabled options={[{ name: "Owner", value: "owner" }]} />
            </div>
          )}

          {sortedItems().map((item, idx) => {
            return (
              <div key={idx} className="flex justify-between space-x-2 px-2 py-2">
                <div className="flex w-1/2 flex-col">
                  <div className="text-xs font-bold uppercase text-muted-foreground">
                    {item.tenantId ? (
                      <span>{t("models.tenant.object")}</span>
                    ) : item.roleId ? (
                      <span>{t("models.role.object")}</span>
                    ) : item.groupId ? (
                      <span>{t("models.group.object")}</span>
                    ) : item.userId ? (
                      <span>{t("models.user.object")}</span>
                    ) : item.public ? (
                      <span>{t("shared.public")}</span>
                    ) : null}
                  </div>
                  <div className="truncate text-sm text-foreground">{getName(item)}</div>
                </div>
                <InputSelect
                  className="w-1/2"
                  value={item.access}
                  options={[
                    { name: t("shared.permissions.canView"), value: "view" },
                    { name: t("shared.permissions.canComment"), value: "comment" },
                    { name: t("shared.permissions.canEdit"), value: "edit" },
                    { name: t("shared.permissions.canDelete"), value: "delete" },
                    { name: "Remove", value: "remove" },
                  ]}
                  onChange={(value) => {
                    if (value === "remove") {
                      const form = new FormData();
                      form.set("action", "remove");
                      form.set("id", item?.id ?? "");
                      // In Next.js, you would typically use a server action or form submission
                      // This would need to be handled by a server action or API route
                      const formElement = document.createElement('form');
                      formElement.method = 'post';
                      formElement.action = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
                      form.forEach((value, key) => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = value.toString();
                        formElement.appendChild(input);
                      });
                      document.body.appendChild(formElement);
                      formElement.submit();
                      document.body.removeChild(formElement);
                    } else {
                      const form = new FormData();
                      form.set("action", "set-access");
                      form.set("id", item?.id ?? "");
                      form.set("access", value?.toString() ?? "");
                      // In Next.js, you would typically use a server action or form submission
                      const formElement = document.createElement('form');
                      formElement.method = 'post';
                      formElement.action = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
                      form.forEach((value, key) => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = value.toString();
                        formElement.appendChild(input);
                      });
                      document.body.appendChild(formElement);
                      formElement.submit();
                      document.body.removeChild(formElement);
                    }
                  }}
                />
              </div>
            );
          })}
        </ul>
      )}
      {!adding && getTypes().length > 0 && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border p-2 text-center hover:border-border focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          <PlusIcon className="mx-auto h-4 text-muted-foreground" />
          <span className="mt-2 block text-sm font-medium text-foreground">{t("shared.shareWith")}...</span>
        </button>
      )}
      {adding && <NewPermissionForm tenants={tenants} users={users} onClose={() => setAdding(false)} types={getTypes()} />}
      {/* Error handling would need to be implemented differently in Next.js */}
      {/* {actionData?.error && <ErrorBanner title={t("shared.error")} text={actionData?.error} />} */}
      {/* {actionData?.success && <InfoBanner title={t("shared.success")} text={actionData?.success} />} */}
    </div>
  );
}

function NewPermissionForm({
  tenants,
  users,
  types,
  onClose,
}: {
  tenants: Tenant[];
  users: UserWithDetailsDto[];
  types: { name: string; value: string; color: Colors }[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const appData = useAppData();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appOrAdminData = useAppOrAdminData();

  const [type, setType] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [access, setAccess] = useState<string>("view");

  // Remove the useEffect that depended on navigation state
  // In Next.js, you would handle form submission differently

  useEffect(() => {
    if (users.length > 0) {
      setType("user");
    } else if (tenants.length > 0) {
      setType("tenant");
    } else if (appOrAdminData?.allRoles.length ?? 0 > 0) {
      setType("role");
    } else if (appOrAdminData?.myGroups.length ?? 0 > 0) {
      setType("group");
    }
  }, [appOrAdminData?.allRoles.length, appOrAdminData?.myGroups.length, tenants.length, users.length]);

  function getOptionValues() {
    if (type === "user") {
      return users.map((i) => {
        return { name: i.email + ` (${i.firstName} ${i.lastName})` + (appOrAdminData?.user?.id === i.id ? ` (${t("shared.you")})` : ""), value: i.id };
      });
    } else if (type === "tenant") {
      return tenants.map((i) => {
        return { name: i.name + (appData.currentTenant?.id === i.id ? ` (${t("shared.current")})` : ""), value: i.id };
      });
    } else if (type === "role") {
      return appOrAdminData?.allRoles.map((i) => {
        return { name: i.name, value: i.id };
      }) ?? [];
    } else if (type === "group") {
      return appOrAdminData?.myGroups.map((i) => {
        return { name: i.name, value: i.id };
      }) ?? [];
    }
    return [];
  }
  function missingFields() {
    return !type || !id || !access;
  }
  return (
    <form method="post" action={pathname + (searchParams.toString() ? '?' + searchParams.toString() : '')}>
      <input type="hidden" name="action" value="share" hidden readOnly />

      <div className="space-y-2">
        <InputSelector
          name="type"
          withSearch={false}
          withColors={false}
          className="w-full"
          title={t("shared.shareWith") + "..."}
          value={type}
          setValue={(e) => setType(e?.toString() ?? "")}
          options={types}
        />
        <InputSelector name="id" withSearch={true} className="col-span-2" value={id} setValue={(e) => setId(e?.toString() ?? "")} options={getOptionValues()} />

        <InputSelector
          name="access"
          withSearch={false}
          value={access}
          setValue={(e) => setAccess(e?.toString() ?? "")}
          options={[
            { name: t("shared.permissions.canView"), value: "view" },
            { name: t("shared.permissions.canComment"), value: "comment" },
            { name: t("shared.permissions.canEdit"), value: "edit" },
            { name: t("shared.permissions.canDelete"), value: "delete" },
          ]}
        />

        <div className="flex justify-end">
          <div className="flex space-x-2">
            <ButtonSecondary onClick={onClose}>{t("shared.cancel")}</ButtonSecondary>
            <ButtonPrimary type="submit" disabled={missingFields()}>
              {t("shared.share")}
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </form>
  );
}
