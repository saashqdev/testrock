"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UsersTable from "@/components/core/users/UsersTable";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useAdminData } from "@/lib/state/useAdminData";
import InputFilters from "@/components/ui/input/InputFilters";
import { Button } from "@/components/ui/button";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { UserWithDetailsDto } from "@/db/models/accounts/UsersModel";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { Log } from "@prisma/client";

interface ComponentProps {
  items: UserWithDetailsDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  lastLogs: { userId: string; log: Log }[];
}

export default function Component({ items, filterableProperties, pagination, lastLogs }: ComponentProps) {
  const { t } = useTranslation();
  const adminData = useAdminData();
  const router = useRouter();

  return (
    <EditPageLayout
      title={t("models.user.plural")}
      buttons={
        <>
          <InputFilters size="sm" filters={filterableProperties} />
          <Button asChild type="button" variant="default" size="sm">
            <Link href="/admin/accounts/users/new">{t("shared.new")}</Link>
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
      />

      <SlideOverWideEmpty
        open={false}
        onClose={() => {
          router.replace(".");
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4"></div>
        </div>
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}
