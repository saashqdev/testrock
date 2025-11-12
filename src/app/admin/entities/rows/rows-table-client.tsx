"use client";

import Link from "next/link";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import TableSimple from "@/components/ui/tables/TableSimple";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import RowHelper from "@/lib/helpers/RowHelper";
import DateUtils from "@/lib/shared/DateUtils";
import UrlUtils from "@/lib/utils/UrlUtils";
import ActivityHistoryIcon from "@/components/ui/icons/entities/ActivityHistoryIcon";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import { useTranslation } from "react-i18next";

interface RowsTableClientProps {
  items: RowWithDetailsDto[];
  entities: EntityWithDetailsDto[];
  pagination: PaginationDto;
}

export default function RowsTableClient({ items, entities, pagination }: RowsTableClientProps) {
  const { t } = useTranslation();

  function findEntity(item: RowWithDetailsDto) {
    return entities.find((e) => e.id === item.entityId);
  }

  return (
    <TableSimple
      headers={[
        {
          name: "object",
          title: "Object",
          value: (item) => item.id,
          formattedValue: (item) => (
            <div>
              <ShowPayloadModalButton title="Details" description={"Details"} payload={JSON.stringify(item)} />
            </div>
          ),
        },
        {
          name: "tenant",
          title: t("models.tenant.object"),
          value: (item) => (
            <div>
              {item.tenant ? (
                <Link
                  href={UrlUtils.currentTenantUrl({ tenant: item.tenant.slug }, "")}
                  className="focus:bg-secondary/90 hover:border-border rounded-md border-b border-dashed border-transparent"
                >
                  {item.tenant.name}
                </Link>
              ) : (
                <div>-</div>
              )}
            </div>
          ),
        },
        {
          name: "entity",
          title: t("models.entity.object"),
          value: (i) => t(findEntity(i)?.title ?? ""),
        },
        {
          name: "folio",
          title: t("models.row.folio"),
          value: (i) => RowHelper.getRowFolio(findEntity(i)!, i),
        },
        {
          name: "description",
          title: t("shared.description"),
          value: (i) => RowHelper.getTextDescription({ entity: findEntity(i)!, item: i, t }),
        },
        {
          name: "logs",
          title: t("models.log.plural"),
          value: (item) => (
            <Link href={"/admin/entities/logs?rowId=" + item.id}>
              <ActivityHistoryIcon className="hover:text-theme-800 text-muted-foreground h-4 w-4" />
            </Link>
          ),
        },
        {
          name: "createdByUser",
          title: t("shared.createdBy"),
          value: (item) => item.createdByUser?.email ?? (item.createdByApiKey ? "API" : "?"),
          className: "text-muted-foreground text-xs",
          breakpoint: "sm",
        },
        {
          name: "createdAt",
          title: t("shared.createdAt"),
          value: (item) => DateUtils.dateAgo(item.createdAt),
          formattedValue: (item) => (
            <div className="flex flex-col">
              <div>{DateUtils.dateYMD(item.createdAt)}</div>
              <div className="text-xs">{DateUtils.dateAgo(item.createdAt)}</div>
            </div>
          ),
          className: "text-muted-foreground text-xs",
          breakpoint: "sm",
          sortable: true,
        },
      ]}
      items={items}
      pagination={pagination}
    />
  );
}
