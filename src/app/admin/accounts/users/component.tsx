"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import UsersTable from "@/components/core/users/UsersTable";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useAdminData } from "@/lib/state/useAdminData";
import InputFilters from "@/components/ui/input/InputFilters";
import { Button } from "@/components/ui/button";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import UserEditForm from "@/components/core/users/UserEditForm";
import UserCreateForm from "@/components/core/users/UserCreateForm";
import UserRolesForm from "@/components/core/users/UserRolesForm";
import { UserWithDetailsDto } from "@/db/models/accounts/UsersModel";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { Log } from "@prisma/client";

interface ComponentProps {
  items: UserWithDetailsDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  lastLogs: { userId: string; log: Log }[];
  adminRoles: RoleWithPermissionsDto[];
}

export default function Component({ items, filterableProperties, pagination, lastLogs, adminRoles }: ComponentProps) {
  const { t } = useTranslation();
  const adminData = useAdminData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const modalType = searchParams?.get("modal");
  const isModalOpen = modalType === "edit" || modalType === "new" || modalType === "roles";
  const selectedUserId = searchParams?.get("userId");
  const selectedUser = items.find(item => item.id === selectedUserId);

  return (
    <EditPageLayout
      title={t("models.user.plural")}
      buttons={
        <>
          <InputFilters size="sm" filters={filterableProperties} />
          <Button 
            type="button" 
            variant="default" 
            size="sm"
            onClick={() => {
              const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
              newSearchParams.set("modal", "new");
              router.push(`?${newSearchParams.toString()}`);
            }}
          >
            {t("shared.new")}
          </Button>
        </>
      }
    >
      <UsersTable
        items={items}
        canImpersonate={getUserHasPermission(adminData, "admin.users.impersonate")}
        canChangePassword={getUserHasPermission(adminData, "admin.users.changePassword")}
        canDelete={getUserHasPermission(adminData, "admin.users.delete")}
        canSetUserRoles={adminData?.isSuperAdmin ?? false}
        pagination={pagination}
        lastLogs={lastLogs}
        onView={(user) => {
          const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
          newSearchParams.set("modal", "edit");
          newSearchParams.set("userId", user.id);
          router.push(`?${newSearchParams.toString()}`);
        }}
        onSetRoles={(user) => {
          const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
          newSearchParams.set("modal", "roles");
          newSearchParams.set("userId", user.id);
          router.push(`?${newSearchParams.toString()}`);
        }}
      />

      <SlideOverWideEmpty
        title={
          modalType === "new" 
            ? t("shared.new") + " " + t("models.user.object") 
            : modalType === "roles" && selectedUser
            ? t("admin.users.setAdminRoles") + " - " + selectedUser.email
            : selectedUser 
            ? `${t("shared.edit")} ${selectedUser.email}` 
            : "Edit User"
        }
        open={isModalOpen}
        onClose={() => {
          const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
          newSearchParams.delete("modal");
          newSearchParams.delete("userId");
          router.replace(`?${newSearchParams.toString()}`);
        }}
        size="2xl"
        overflowYScroll={true}
      >
        {modalType === "new" ? (
          <UserCreateForm
            adminRoles={adminRoles}
            onSuccess={() => {
              const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
              newSearchParams.delete("modal");
              router.replace(`?${newSearchParams.toString()}`);
              router.refresh();
            }}
            onCancel={() => {
              const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
              newSearchParams.delete("modal");
              router.replace(`?${newSearchParams.toString()}`);
            }}
          />
        ) : modalType === "roles" && selectedUser ? (
          <UserRolesForm
            user={selectedUser}
            adminRoles={adminRoles}
            onSuccess={() => {
              const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
              newSearchParams.delete("modal");
              newSearchParams.delete("userId");
              router.replace(`?${newSearchParams.toString()}`);
              router.refresh();
            }}
            onCancel={() => {
              const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
              newSearchParams.delete("modal");
              newSearchParams.delete("userId");
              router.replace(`?${newSearchParams.toString()}`);
            }}
          />
        ) : selectedUser ? (
          <UserEditForm
            user={selectedUser}
            onSuccess={() => {
              const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
              newSearchParams.delete("modal");
              newSearchParams.delete("userId");
              router.replace(`?${newSearchParams.toString()}`);
              router.refresh();
            }}
            onCancel={() => {
              const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
              newSearchParams.delete("modal");
              newSearchParams.delete("userId");
              router.replace(`?${newSearchParams.toString()}`);
            }}
          />
        ) : (
          <p className="text-muted-foreground">No user selected</p>
        )}
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}
