"use client";

import { DashboardStats } from "@/components/ui/stats/DashboardStats";
import SetupSteps from "@/components/admin/SetupSteps";
import ProfileBanner from "@/components/app/ProfileBanner";
import TenantsTable from "@/components/core/tenants/TenantsTable";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import InputSelect from "@/components/ui/input/InputSelect";
import { defaultPeriodFilter, PeriodFilters } from "@/lib/helpers/PeriodHelper";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AdminDashboardLoaderData } from "./page";

export default function AdminDashboardComponent({ data }: { data: AdminDashboardLoaderData }) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <main className="relative z-0 flex-1 pb-8">
      {/* Page header */}
      {appOrAdminData?.user && (
        <div className="bg-background lg:border-border hidden shadow-xs md:block lg:border-t">
          <ProfileBanner user={appOrAdminData.user} />
        </div>
      )}

      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-5 sm:px-8">
        {getUserHasPermission(appOrAdminData, "admin.dashboard.view") ? (
          <div className="space-y-5 overflow-hidden">
            {/* Setup Steps */}
            <div className="overflow-x-auto">
              {data.setupSteps.filter((f) => !f.completed).length > 0 && (
                <SetupSteps items={data.setupSteps} />
              )}
            </div>

            {/* Dashboard Summary */}
            <div className="space-y-3 truncate p-1">
              <div className="flex items-center justify-between space-x-2">
                <h3 className="text-foreground grow font-medium leading-4">
                  {t("app.dashboard.summary")}
                </h3>
                <div>
                  <InputSelect
                    className="w-44"
                    name="period"
                    value={searchParams.get("period")?.toString() ?? defaultPeriodFilter}
                    options={PeriodFilters.map((f) => {
                      return {
                        value: f.value,
                        name: t(f.name),
                      };
                    })}
                    onChange={(value) => {
                      const params = new URLSearchParams(searchParams.toString());
                      if (value && value !== defaultPeriodFilter) {
                        params.set("period", value?.toString() ?? "");
                      } else {
                        params.delete("period");
                      }
                      router.push(`${pathname}?${params.toString()}`);
                    }}
                  />
                </div>
              </div>
              <DashboardStats items={data.stats} />
            </div>

            {/* Tenants Table */}
            <div className="space-y-4 overflow-x-auto p-1">
              <div className="flex items-center justify-between space-x-2">
                <h3 className="text-foreground font-medium leading-4">
                  {t("models.tenant.plural")}
                </h3>
                <ButtonSecondary to="/admin/accounts">
                  {t("shared.viewAll")}
                </ButtonSecondary>
              </div>
              <TenantsTable items={data.tenants.items} pagination={data.tenants.pagination} />
            </div>
          </div>
        ) : (
          <div className="font-medium">
            You don&apos;t have permission to view the dashboard.
          </div>
        )}
      </div>
    </main>
  );
}
