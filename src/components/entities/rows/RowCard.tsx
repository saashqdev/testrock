"use client";

import clsx from "clsx";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ColumnDto } from "@/lib/dtos/data/ColumnDto";
import { RowHeaderDisplayDto } from "@/lib/dtos/data/RowHeaderDisplayDto";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import { EntitiesApi } from "@/utils/api/server/EntitiesApi";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import RowDisplayHeaderHelper from "@/lib/helpers/RowDisplayHeaderHelper";
import RowDisplayValueHelper from "@/lib/helpers/RowDisplayValueHelper";

interface Props {
  entity: EntityWithDetailsDto;
  item: RowWithDetailsDto;
  layout: string;
  columns?: ColumnDto[];
  allEntities: EntityWithDetailsDto[];
  routes?: EntitiesApi.Routes;
  actions?: (row: RowWithDetailsDto) => {
    title?: string;
    href?: string;
    onClick?: () => void;
    isLoading?: boolean;
    render?: React.ReactNode;
  }[];
}
export default function RowCard({ entity, item, columns, layout, allEntities, routes, actions }: Props) {
  const { t } = useTranslation();
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RowWithDetailsDto>[]>([]);

  useEffect(() => {
    setHeaders(RowDisplayHeaderHelper.getDisplayedHeaders({ entity, columns, layout, allEntities: allEntities, t, routes }));
  }, [entity, columns, layout, allEntities, t, routes]);

  return (
    <div className="flex flex-col space-y-2 whitespace-nowrap text-sm text-muted-foreground">
      {headers.map((header, idx) => {
        return (
          <div key={idx} className={clsx("flex flex-col", header.className)}>
            <div className="text-xs font-medium text-muted-foreground">{t(header.title)}</div>
            <div>{RowDisplayValueHelper.displayRowValue(t, header, item, idx)}</div>
          </div>
        );
      })}
      {actions && (
        <div className="flex flex-col space-y-2">
          {actions(item).map((action, idx) => {
            return (
              <Fragment key={idx}>
                {action.render ?? (
                  <ButtonSecondary
                    className="w-full"
                    to={action.href}
                    isLoading={action.isLoading}
                    onClick={(e) => {
                      if (action.onClick) {
                        e.stopPropagation();
                        e.preventDefault();
                        action.onClick();
                      }
                    }}
                  >
                    <div className="flex w-full justify-center">{action.title}</div>
                  </ButtonSecondary>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
