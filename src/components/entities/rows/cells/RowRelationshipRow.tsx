"use client";

import Link from "next/link";
import { Fragment } from "react";
import { TFunction } from "i18next";
import { RowDto } from "@/modules/rows/repositories/RowDto";
import { EntitiesApi } from "@/utils/api/server/EntitiesApi";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import EntityHelper from "@/lib/helpers/EntityHelper";
import RowHelper from "@/lib/helpers/RowHelper";

export default function RowRelationshipRow({
  entity,
  item,
  onRelatedRowClick,
  routes,
  t,
}: {
  entity: EntityWithDetailsDto;
  item: RowDto;
  onRelatedRowClick?: () => void;
  routes?: EntitiesApi.Routes;
  t: TFunction;
}) {
  return (
    <Fragment>
      {onRelatedRowClick !== undefined ? (
        <button type="button" onClick={onRelatedRowClick} className="hover truncate text-left text-sm hover:underline">
          {RowHelper.getTextDescription({ entity: entity, item, t })}
        </button>
      ) : !routes || !EntityHelper.getRoutes({ routes, entity: entity, item })?.overview ? (
        <div className="hover truncate text-left text-sm hover:underline">{RowHelper.getTextDescription({ entity: entity, item, t })}</div>
      ) : (
        <Link
          onClick={(e) => e.stopPropagation()}
          href={EntityHelper.getRoutes({ routes, entity: entity, item })?.overview ?? ""}
          className="hover truncate text-left text-sm hover:underline"
        >
          {RowHelper.getTextDescription({ entity: entity, item, t })}
        </Link>
      )}
    </Fragment>
  );
}
