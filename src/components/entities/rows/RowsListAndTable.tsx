"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import TableSimple from "@/components/ui/tables/TableSimple";
import { RowHeaderDisplayDto } from "@/lib/dtos/data/RowHeaderDisplayDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { ColumnDto } from "@/lib/dtos/data/ColumnDto";
import RowDisplayHeaderHelper from "@/lib/helpers/RowDisplayHeaderHelper";
import { RowHeaderActionDto } from "@/lib/dtos/data/RowHeaderActionDto";
import { EntitiesApi } from "@/utils/api/server/EntitiesApi";
import EntityHelper from "@/lib/helpers/EntityHelper";
import TrashIcon from "@/components/ui/icons/TrashIcon";

interface Props {
  entity: EntityWithDetailsDto;
  items: RowWithDetailsDto[];
  routes?: EntitiesApi.Routes;
  columns?: ColumnDto[];
  pagination?: PaginationDto;
  className?: string;
  editable?: boolean;
  selectedRows?: RowWithDetailsDto[];
  onSelected?: (item: RowWithDetailsDto[]) => void;
  onFolioClick?: (item: RowWithDetailsDto) => void;
  onEditClick?: (item: RowWithDetailsDto) => void;
  onRelatedRowClick?: (item: RowWithDetailsDto) => void;
  leftHeaders?: RowHeaderDisplayDto<RowWithDetailsDto>[];
  rightHeaders?: RowHeaderDisplayDto<RowWithDetailsDto>[];
  allEntities: EntityWithDetailsDto[];
  onRemove?: (item: RowWithDetailsDto) => void;
}

export default function RowsListAndTable({
  entity,
  routes,
  items,
  pagination,
  className = "",
  columns,
  editable = true,
  selectedRows,
  onSelected,
  onFolioClick,
  onEditClick,
  onRelatedRowClick,
  leftHeaders,
  rightHeaders,
  allEntities,
  onRemove,
}: Props) {
  const { t } = useTranslation();

  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RowWithDetailsDto>[]>([]);
  const [actions, setActions] = useState<RowHeaderActionDto<RowWithDetailsDto>[]>([]);

  useEffect(() => {
    let headers = RowDisplayHeaderHelper.getDisplayedHeaders({
      routes,
      entity,
      columns,
      layout: "table",
      allEntities,
      onFolioClick,
      onEditClick,
      onRelatedRowClick,
      t,
    });
    if (leftHeaders) {
      headers = [...leftHeaders, ...headers];
    }
    if (rightHeaders) {
      headers = [...headers, ...rightHeaders];
    }
    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, columns]);

  useEffect(() => {
    const actions: RowHeaderActionDto<RowWithDetailsDto>[] = [];
    if (editable) {
      actions.push({
        title: t("shared.edit"),
        onClickRoute: (_, item) => (onEditClick !== undefined ? undefined : EntityHelper.getRoutes({ routes, entity, item })?.edit ?? ""),
        onClick: (_, item) => (onEditClick !== undefined ? onEditClick(item) : undefined),
        hidden: (item) => !editable || !EntityHelper.getRoutes({ routes, entity, item })?.edit,
      });
    }
    if (onRemove) {
      actions.push({
        title: (
          <div>
            <TrashIcon className="h-4 w-4 text-gray-300 hover:text-muted-foreground" />
          </div>
        ),
        onClick: (_, item) => onRemove(item),
        firstColumn: true,
      });
    }
    setActions(actions);
  }, [editable, entity, onEditClick, onRemove, routes, t]);

  function getHref(item: RowWithDetailsDto) {
    return EntityHelper.getRoutes({ routes, entity, item })?.overview;
  }

  function mapInputType(type: any): "number" | "text" | "select" | "decimal" | undefined {
    if (!type) return undefined;
    const s = String(type).toLowerCase();
    if (s === "text" || s === "string" || s.endsWith("text")) return "text";
    if (s === "number" || s === "numeric" || s.endsWith("number")) return "number";
    if (s === "select" || s.endsWith("select")) return "select";
    if (s === "decimal" || s.endsWith("decimal")) return "decimal";
    return undefined;
  }

  const tableHeaders = headers.map((h) => ({
    ...h,
    // normalize any enum/other InputType values to the string union TableSimple expects
    type: mapInputType((h as any).type),
  }));

  return (
    <div className={className}>
      <TableSimple
        headers={tableHeaders as any}
        items={items}
        pagination={pagination}
        selectedRows={selectedRows}
        onSelected={onSelected}
        actions={actions}
        onClickRoute={(_, item) => getHref(item)}
      />
    </div>
  );
}
