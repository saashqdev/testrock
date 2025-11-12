"use client";

import { LogsModel } from "@/db/models/logs/LogsModel";
import { RolesModel} from "@/db/models/permissions/RolesModel";
import { UsersModel } from "@/db/models/accounts/UsersModel";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import TableSimple, { RowHeaderDisplayDto, RowHeaderActionDto } from "@/components/ui/tables/TableSimple";
import { UserWithDetailsDto } from "@/db/models/accounts/UsersModel";
import DateUtils from "@/lib/shared/DateUtils";
import UserBadge from "./UserBadge";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { 
  impersonateUser, 
  changeUserPassword, 
  deleteUser as deleteUserAction 
} from "@/app/admin/accounts/users/actions";
import toast from "react-hot-toast";

interface Props {
  items: UserWithDetailsDto[];
  canImpersonate: boolean;
  canChangePassword: boolean;
  canSetUserRoles?: boolean;
  canDelete: boolean;
  pagination?: PaginationDto;
  lastLogs?: { userId: string; log: LogsModel }[];
}
export default function UsersTable({ items, canImpersonate, canChangePassword, canSetUserRoles, canDelete, pagination, lastLogs }: Props) {
  const { t } = useTranslation();

  const confirmDelete = useRef<RefConfirmModal>(null);

  const [headers, setHeaders] = useState<RowHeaderDisplayDto<UserWithDetailsDto>[]>([]);
  const [actions, setActions] = useState<RowHeaderActionDto<UserWithDetailsDto>[]>([]);

  useEffect(() => {
    function getUserRoles(user: UserWithDetailsDto, tenantId: string | null): RolesModel[] {
      const roles: RolesModel[] = [];
      user.roles
        .filter((f) => (tenantId ? f.tenantId === tenantId && f.role.type === "app" : f.role.type === "admin"))
        .forEach((role) => {
          if (roles.find((f) => f.name === role.role.name) === undefined) {
            roles.push(role.role);
          }
        });
      // sort by type then by order
      const sorted = roles.sort((a, b) => {
        if (a.type === b.type) {
          return a.order - b.order;
        }
        // sort by type (text)
        return a.type.localeCompare(b.type);
      });
      return sorted;
    }
    const headers: RowHeaderDisplayDto<UserWithDetailsDto>[] = [
      {
        name: "user",
        title: t("models.user.object"),
        value: (i) => i.email,
        formattedValue: (item) => <UserBadge item={item} admin={item.admin} withAvatar={true} withSignUpMethod={true} />,
        sortBy: "email",
      },
      {
        name: "tenants",
        title: t("app.users.accountsAndRoles"),
        value: (i) => (
          <div className="max-w-sm truncate">
            <div
              className="truncate italic text-muted-foreground"
              title={getUserRoles(i, null)
                .map((x) => x.name)
                .join(", ")}
            >
              {getUserRoles(i, null)
                .map((x) => x.name)
                .join(", ")}
            </div>
            {i.tenants.map((f) => {
              return (
                <div key={f.id} className="truncate">
                  <Link
                    href={"/app/" + f.tenant.slug}
                    className="border-b border-dashed border-transparent hover:border-dashed hover:border-border focus:bg-secondary/90"
                  >
                    <span>{f.tenant.name}</span>
                  </Link>{" "}
                  {getUserRoles(i, f.tenantId).length > 0 ? (
                    <span
                      className="truncate text-xs italic text-muted-foreground"
                      title={getUserRoles(i, f.tenantId)
                        .map((x) => x.name)
                        .join(", ")}
                    >
                      (
                      {getUserRoles(i, f.tenantId)
                        .map((x) => x.name)
                        .join(", ")}
                      )
                    </span>
                  ) : (
                    <span className="truncate text-xs italic text-red-500">({t("app.users.undefinedRoles")})</span>
                  )}
                </div>
              );
            })}
          </div>
        ),
      },
      {
        name: "lastActivity",
        title: t("shared.lastActivity"),
        value: (item) => <LastActivity item={item} lastLogs={lastLogs} />,
      },
      {
        name: "createdAt",
        title: t("shared.createdAt"),
        value: (i) => DateUtils.dateDM(i.createdAt),
        formattedValue: (item) => (
          <time dateTime={DateUtils.dateYMDHMS(item.createdAt)} title={DateUtils.dateYMDHMS(item.createdAt)} suppressHydrationWarning>
            {DateUtils.dateAgo(item.createdAt)}
          </time>
        ),
        sortBy: "createdAt",
      },
    ];

    const actions: RowHeaderActionDto<UserWithDetailsDto>[] = [];
    if (canImpersonate) {
      actions.push({
        title: t("models.user.impersonate"),
        onClick: (_, item) => impersonate(item),
        disabled: (_) => !canImpersonate,
      });
    }
    if (canChangePassword) {
      actions.push({
        title: t("settings.profile.changePassword"),
        onClick: (_, item) => changePassword(item),
        disabled: (_) => !canChangePassword,
      });
    }
    if (canSetUserRoles) {
      actions.push({
        title: t("admin.users.setAdminRoles"),
        onClickRoute: (_, item) => `/admin/accounts/users/${item.email}/roles`,
      });
    }
    if (canDelete) {
      actions.push({
        title: t("shared.delete"),
        onClick: (_, item) => deleteUser(item),
        disabled: (_) => !canDelete,
        destructive: true,
      });
    }

    setActions(actions);
    setHeaders(headers);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lastLogs, t]);

  function impersonate(user: UserWithDetailsDto) {
    const form = new FormData();
    form.set("user-id", user.id);
    impersonateUser(user.id).then((result) => {
      if (result && 'error' in result) {
        toast.error(result.error);
      } else {
        // Redirect will be handled by the server action
        window.location.reload();
      }
    }).catch((error: any) => {
      toast.error(error.message || "An error occurred");
    });
  }
  function changePassword(user: UserWithDetailsDto) {
    const password = prompt(t("settings.profile.changePassword") + " - " + user.email);
    if (password && confirm("[ADMINISTRATOR] Update password for user " + user.email + "?")) {
      const form = new FormData();
      form.set("user-id", user.id);
      form.set("password-new", password);
      changeUserPassword(user.id, password).then((result) => {
        if (result.error) {
          toast.error(result.error);
        } else if (result.success) {
          toast.success(result.success);
        }
      }).catch((error: any) => {
        toast.error(error.message || "An error occurred");
      });
    }
  }
  function deleteUser(item: UserWithDetailsDto) {
    if (confirmDelete.current) {
      confirmDelete.current.setValue(item);
      confirmDelete.current.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("admin.users.deleteWarning"));
    }
  }
  function confirmDeleteUser(item: UsersModel) {
    const form = new FormData();
    form.set("user-id", item.id);
    deleteUserAction(item.id).then((result) => {
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.success);
      }
    }).catch((error: any) => {
      toast.error(error.message || "An error occurred");
    });
  }

  return (
    <div>
      <TableSimple items={items} headers={headers} actions={actions} pagination={pagination} />
      <ConfirmModal ref={confirmDelete} onYes={confirmDeleteUser} destructive />
    </div>
  );
}

function LastActivity({ item, lastLogs, action }: { item: UserWithDetailsDto; lastLogs?: { userId: string; log: LogsModel }[]; action?: string }) {
  const lastLog = lastLogs?.find((f) => f.userId === item.id && (!action || f.log.action === action));
  if (lastLog) {
    return (
      <div className="text-sm text-muted-foreground" suppressHydrationWarning>
        {!action && lastLog.log.action} {DateUtils.dateAgo(lastLog.log.createdAt)}
      </div>
    );
  }
  return null;
}
