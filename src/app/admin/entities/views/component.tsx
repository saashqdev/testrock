"use client";

import { useTranslation } from "react-i18next";
import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import clsx from "clsx";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import TabsWithIcons from "@/components/ui/tabs/TabsWithIcons";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import InputFilters from "@/components/ui/input/InputFilters";
import EntityViewsTable from "@/components/entities/views/EntityViewsTable";
import { EntityViewsWithTenantAndUserDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";

type EntityViewsClientProps = {
  items: EntityViewsWithTenantAndUserDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};

export default function EntityViewsClient({ items, pagination, filterableProperties }: EntityViewsClientProps) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";

  return (
    <EditPageLayout
      title={
        <TabsWithIcons
          breakpoint="lg"
          tabs={[
            {
              name: "All",
              href: "/admin/entities/views",
              current: pathname + search === "/admin/entities/views",
            },
            {
              name: "All accounts",
              href: "/admin/entities/views?type=default",
              current: pathname + search === "/admin/entities/views?type=default",
            },
            {
              name: t("models.view.types.tenant"),
              href: "/admin/entities/views?type=tenant",
              current: pathname + search === "/admin/entities/views?type=tenant",
            },
            {
              name: t("models.view.types.user"),
              href: "/admin/entities/views?type=user",
              current: pathname + search === "/admin/entities/views?type=user",
            },
            {
              name: t("models.view.types.system"),
              href: "/admin/entities/views?type=system",
              current: pathname + search === "/admin/entities/views?type=system",
            },
          ]}
        />
      }
      buttons={
        <>
          <InputFilters filters={filterableProperties} withSearch={false} />
          <Dropdown
            right={false}
            button={<span>{t("shared.add")} view</span>}
            disabled={appOrAdminData?.entities.length === 0}
            options={
              <div>
                {appOrAdminData?.entities
                  .filter((f) => f.hasViews)
                  .map((f) => {
                    return (
                      <Menu.Item key={f.id}>
                        {({ active }) => (
                          <Link
                            href={`/admin/entities/views/new/${f.name}${search}`}
                            className={clsx("w-full truncate", active ? "text-foreground bg-secondary/90" : "text-foreground/80", "block px-4 py-2 text-sm")}
                          >
                            <div className="truncate">
                              {t(f.title)} <span className="text-muted-foreground text-xs">({f.name})</span>
                            </div>
                          </Link>
                        )}
                      </Menu.Item>
                    );
                  })}
              </div>
            }
          ></Dropdown>
        </>
      }
    >
      <EntityViewsTable
        items={items}
        onClickRoute={(i) => {
          return `/admin/entities/views/${i.id}${search}`;
        }}
      />

      <SlideOverWideEmpty
        title={params.id ? "Edit view" : params.entity ? `New ${params.entity} view` : "New view"}
        open={!!params.id || !!params.entity}
        onClose={() => {
          router.replace("." + search);
        }}
        className="sm:max-w-2xl"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{/* Add your form components here */}</div>
        </div>
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}
