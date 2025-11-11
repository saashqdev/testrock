"use client";

import { useRouter } from "next/navigation";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { useTranslation } from "react-i18next";
import InputFilters from "@/components/ui/input/InputFilters";
import InputSearchWithURL from "@/components/ui/input/InputSearchWithURL";
import TableSimple from "@/components/ui/tables/TableSimple";
import { PortalWithCountDto } from "@/db/models/portals/PortalsModel";
import DateCell from "@/components/ui/dates/DateCell";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import { FilterableValueLink } from "@/components/ui/links/FilterableValueLink";
import Link from "next/link";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { deletePortal } from "./actions";
import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";

interface ComponentProps {
  items: (PortalWithCountDto & { portalUrl?: string })[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  appConfiguration: AppConfigurationDto;
}

export default function Component({ items, filterableProperties, pagination, appConfiguration }: ComponentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      const result = await deletePortal(id);

      if (result.success) {
        toast.success(result.success);
        router.refresh();
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <EditPageLayout title={t("models.portal.plural")}>
      {!appConfiguration.portals?.enabled && (
        <WarningBanner title={t("shared.warning")}>
          Portals are not enabled. Enable it at <code className="font-bold">app/utils/db/appConfiguration.db.server.ts</code>.
        </WarningBanner>
      )}
      <div className="space-y-2">
        <div className="flex w-full items-center space-x-2">
          <div className="grow">
            <InputSearchWithURL />
          </div>
          <InputFilters filters={filterableProperties} />
        </div>
        <TableSimple
          items={items}
          pagination={pagination}
          actions={[
            {
              title: t("shared.overview"),
              onClickRoute: (_, item) => (item.tenant ? `/app/${item.tenant.slug}/portals/${item.id}` : `/admin/portals/${item.id}`),
            },
            {
              title: t("shared.delete"),
              onClick: (_, item) => {
                handleDelete(item.id);
              },
              destructive: true,
              confirmation: (i) => ({
                title: t("shared.delete"),
                description: t("shared.warningCannotUndo"),
              }),
            },
          ]}
          headers={[
            {
              name: "tenant",
              title: t("models.tenant.object"),
              value: (item) => <FilterableValueLink name="tenantId" value={item?.tenant?.name ?? "{Admin}"} param={item?.tenant?.id ?? "null"} />,
            },
            {
              name: "title",
              title: t("models.portal.object"),
              className: "w-full",
              value: (item) => (
                <div className="flex flex-col">
                  <div>
                    {item.title}{" "}
                    <Link href={item.portalUrl || item.subdomain} target="_blank" className="text-muted-foreground text-sm hover:underline">
                      ({item.subdomain})
                    </Link>
                  </div>
                </div>
              ),
            },
            {
              name: "users",
              title: "Users",
              value: (item) => <div>{item._count.users}</div>,
            },
            {
              name: "createdAt",
              title: t("shared.createdAt"),
              value: (i) => <DateCell date={i.createdAt ?? null} />,
            },
          ]}
        />
      </div>
    </EditPageLayout>
  );
}
