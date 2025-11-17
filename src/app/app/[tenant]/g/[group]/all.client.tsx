"use client";

import { useTranslation } from "react-i18next";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import RowsList from "@/components/entities/rows/RowsList";
import Link from "next/link";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { GetRowsData } from "@/utils/api/server/RowsApi";
import { Routes } from "@/utils/api/server/EntitiesApi";

type LoaderData = {
  title: string;
  entitiesData: { [entity: string]: GetRowsData };
  entitiesRoutes: { [entity: string]: Routes };
};

interface AllPageClientProps {
  data: LoaderData;
  groupSlug: string;
}

export default function AllPageClient({ data, groupSlug }: AllPageClientProps) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();

  function getGroup() {
    return appOrAdminData?.entityGroups.find((f) => f.slug === groupSlug);
  }

  return (
    <IndexPageLayout>
      <div className="space-y-2">
        {getGroup()?.entities.map(({ entity, allView }) => {
          return (
            <div key={entity.id} className="space-y-1">
              <div className="flex items-center justify-between space-x-2">
                <h3 className="text-sm font-medium">
                  {t(entity.titlePlural)} <span className="text-muted-foreground text-xs">({data.entitiesData[entity.name].items.length})</span>
                </h3>
                <Link
                  href={entity.slug + "/new"}
                  className="text-foreground bg-secondary hover:bg-secondary/90 rounded-full p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                </Link>
              </div>
              <RowsList
                view={(allView?.layout ?? "card") as "table" | "board" | "grid" | "card"}
                entity={entity.name}
                items={data.entitiesData[entity.name].items}
                pagination={data.entitiesData[entity.name].pagination}
              />
            </div>
          );
        })}
      </div>
    </IndexPageLayout>
  );
}
