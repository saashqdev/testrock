"use client";

import { useTranslation } from "react-i18next";
import EmptyState from "@/components/ui/emptyState/EmptyState";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { UserWithRolesDto } from "@/db/models/accounts/UsersModel";
import UserBadge from "../users/UserBadge";
import clsx from "clsx";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import XIcon from "@/components/ui/icons/XIcon";
import Link from "next/link";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";

interface Props {
  items: UserWithRolesDto[];
  roles: RoleWithPermissionsDto[];
  className?: string;
  onChange: (item: UserWithRolesDto, role: RoleWithPermissionsDto, add: any) => void;
  tenantId?: string | null;
  disabled?: boolean;
  onRoleClick?: (role: RoleWithPermissionsDto) => void;
  actions?: {
    onEditRoute?: (item: UserWithRolesDto) => string;
    onImpersonate?: (item: UserWithRolesDto) => void;
  };
}

export default function UserRolesTable({ items, roles, className, onChange, tenantId = null, disabled, onRoleClick, actions }: Props) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();

  return (
    <div>
      {(() => {
        if (items.length === 0) {
          return (
            <div>
              <EmptyState
                className="bg-background"
                captions={{
                  thereAreNo: t("app.users.empty"),
                }}
              />
            </div>
          );
        } else {
          return (
            <div>
              <div>
                <div className="flex flex-col">
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                      <div className="shadow-xs overflow-hidden border border-border sm:rounded-lg">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-secondary">
                            <tr>
                              <th
                                scope="col"
                                className="w-64 select-none truncate px-1 py-1 pl-4 text-left text-xs font-medium tracking-wider text-muted-foreground"
                              >
                                <div className="flex items-center space-x-1 text-muted-foreground">
                                  <div>{t("models.user.plural")}</div>
                                </div>
                              </th>

                              {roles.map((role, idx) => {
                                return (
                                  <th
                                    key={idx}
                                    scope="col"
                                    className="select-none truncate px-1 py-1 text-center text-xs font-medium tracking-wider text-muted-foreground"
                                  >
                                    <div className="flex items-center justify-center space-x-1 text-muted-foreground">
                                      {onRoleClick ? (
                                        <button type="button" onClick={() => onRoleClick(role)} className="hover:underline">
                                          {role.name}
                                        </button>
                                      ) : (
                                        <div>{role.name}</div>
                                      )}
                                    </div>
                                  </th>
                                );
                              })}

                              {actions && (
                                <td className="select-none truncate px-1 py-1 text-center text-xs font-medium tracking-wider text-muted-foreground"></td>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-background">
                            {items.map((item, idx) => {
                              return (
                                <tr key={idx}>
                                  <td className="whitespace-nowrap px-1 py-1 pl-4 text-sm text-muted-foreground">
                                    <UserBadge
                                      item={item}
                                      withAvatar={true}
                                      admin={item.admin}
                                      href={!actions?.onEditRoute ? undefined : actions.onEditRoute(item)}
                                      roles={item.roles}
                                    />
                                  </td>
                                  {roles.map((role) => {
                                    const existing = item.roles.find((f) => f.roleId === role.id && f.tenantId === tenantId) !== undefined;
                                    return (
                                      <td key={role.name} className="whitespace-nowrap px-1 py-1 text-center text-sm text-muted-foreground">
                                        <div className="flex justify-center">
                                          <button
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => onChange(item, role, !existing)}
                                            className={clsx(
                                              "flex h-6 w-6 items-center justify-center rounded-full",
                                              existing ? "bg-background text-foreground" : "text-muted-foreground",
                                              !disabled &&
                                                existing &&
                                                "hover:bg-green-200 hover:text-green-600 dark:hover:bg-green-900 dark:hover:text-green-50",
                                              !disabled && !existing && "hover:bg-gray-200 hover:text-muted-foreground dark:hover:bg-secondary"
                                            )}
                                          >
                                            {existing ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 text-muted-foreground" />}
                                          </button>
                                        </div>
                                      </td>
                                    );
                                  })}
                                  {/* {onEditRoute && (
                                    <td className="whitespace-nowrap px-1 py-1 text-center text-sm text-muted-foreground">
                                      <Link href={onEditRoute(item)} className="hover:underline">
                                        {t("shared.edit")}
                                      </Link>
                                    </td>
                                  )} */}
                                  {actions && (
                                    <td className="whitespace-nowrap px-1 py-1 text-center text-sm text-muted-foreground">
                                      <div className="flex items-center space-x-2">
                                        {actions.onImpersonate && (
                                          <button
                                            type="button"
                                            disabled={!appOrAdminData || item.id === appOrAdminData.user.id}
                                            onClick={() => (actions?.onImpersonate ? actions?.onImpersonate(item) : {})}
                                            className={clsx(
                                              "text-muted-foreground",
                                              appOrAdminData && item.id !== appOrAdminData.user.id ? "hover:underline" : "cursor-not-allowed"
                                            )}
                                          >
                                            {t("models.user.impersonate")}
                                          </button>
                                        )}
                                        {actions.onEditRoute && (
                                          <Link href={actions?.onEditRoute(item)} className="text-muted-foreground hover:underline">
                                            {t("shared.edit")}
                                          </Link>
                                        )}
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      })()}
    </div>
  );
}
