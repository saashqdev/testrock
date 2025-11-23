"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DashboardStats } from "@/components/ui/stats/DashboardStats";
import { Stat } from "@/lib/dtos/stats/Stat";
import InputSelector from "@/components/ui/input/InputSelector";
import PeriodHelper, { defaultPeriodFilter, PeriodFilters } from "@/lib/helpers/PeriodHelper";
import { useTranslation } from "react-i18next";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { EntityGroupWithDetailsDto } from "@/db/models/entityBuilder/EntityGroupsModel";

interface GroupIndexClientProps {
  group: EntityGroupWithDetailsDto;
  stats: Stat[];
}

export default function GroupIndexClient({ group, stats }: GroupIndexClientProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handlePeriodChange = (value: React.SetStateAction<string | number | undefined>) => {
    const newValue = typeof value === "function" ? value(searchParams.get("period") ?? defaultPeriodFilter) : value;
    const newSearchParams = new URLSearchParams(searchParams.toString() || "");
    if (newValue !== undefined && newValue !== null) {
      newSearchParams.set("period", newValue.toString());
    } else {
      newSearchParams.delete("period");
    }
    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    <EditPageLayout>
      {stats.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between space-x-2">
            <h3 className="grow font-medium leading-4 text-foreground">{group.title}</h3>
            <div>
              <InputSelector
                className="w-44"
                withSearch={false}
                name="period"
                value={searchParams.get("period")?.toString() ?? defaultPeriodFilter}
                options={PeriodFilters.map((f) => {
                  return {
                    value: f.value,
                    name: t(f.name),
                  };
                })}
                setValue={handlePeriodChange}
              />
            </div>
          </div>
          <DashboardStats items={stats} />
        </div>
      )}
    </EditPageLayout>
  );
}
