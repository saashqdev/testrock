"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAppData } from "@/lib/state/useAppData";
import { DashboardLoaderData } from "@/lib/state/useDashboardData";
import ProfileBanner from "@/components/app/ProfileBanner";
import { DashboardStats } from "@/components/ui/stats/DashboardStats";
import { Stat } from "@/lib/dtos/stats/Stat";
import InputSelect from "@/components/ui/input/InputSelect";
import { defaultPeriodFilter, PeriodFilters } from "@/lib/helpers/PeriodHelper";
import { useTranslation } from "react-i18next";
import { Fragment, useCallback, useState, useEffect } from "react";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

type DashboardClientProps = {
  data: DashboardLoaderData & {
    title: string;
    stats: Stat[];
  };
};

export default function DashboardClient({ data }: DashboardClientProps) {
  const { t } = useTranslation();
  const appData = useAppData();
  const router = useRouter();
  const pathname = usePathname();

  const [currentPeriod, setCurrentPeriod] = useState<string | number | undefined>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("period") ?? defaultPeriodFilter;
    }
    return defaultPeriodFilter;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const period = new URLSearchParams(window.location.search).get("period") ?? defaultPeriodFilter;
      setCurrentPeriod(period);
    }
  }, []);

  const handlePeriodChange = useCallback((value: React.SetStateAction<string | number | undefined>) => {
    const newValue = typeof value === 'function' ? value(currentPeriod) : value;
    setCurrentPeriod(newValue);
    
    const params = new URLSearchParams(window.location.search);
    if (newValue && newValue !== defaultPeriodFilter) {
      params.set("period", newValue.toString());
    } else {
      params.delete("period");
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }, [router, pathname, currentPeriod]);

  return (
    <main className="relative z-0 flex-1 pb-8">
      {/*Page header */}
      {appData?.user && (
        <div className="bg-background border-border hidden border-b md:block">
          <ProfileBanner user={appData.user} />
        </div>
      )}

      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-5 sm:px-8">
        {getUserHasPermission(appData, "app.dashboard.view") ? (
          <Fragment>
            {data.stats.length > 0 && (
              <div className="space-y-3 truncate p-1">
                <div className="flex items-center justify-between space-x-2">
                  <h3 className="text-foreground grow leading-4 font-medium">{t("app.dashboard.summary")}</h3>
                  <div>
                    <InputSelect
                      className="w-44"
                      name="period"
                      value={currentPeriod}
                      options={PeriodFilters.map((f) => {
                        return {
                          value: f.value,
                          name: t(f.name),
                        };
                      })}
                      onChange={handlePeriodChange}
                    />
                  </div>
                </div>
                <DashboardStats items={data.stats} />
              </div>
            )}
          </Fragment>
        ) : (
          <div className="font-medium">You don&apos;t have permission to view the dashboard.</div>
        )}
      </div>
    </main>
  );
}
