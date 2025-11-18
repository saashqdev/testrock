import { Prisma } from "@prisma/client";
import { getNoCodeRoutes } from "@/utils/api/server/EntitiesApi";
import { count } from "@/utils/api/server/RowsApi";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import EntityHelper from "@/lib/helpers/EntityHelper";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import DateUtils from "@/lib/shared/DateUtils";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { headers } from "next/headers";
import CountPageComponent from "./CountPageComponent";

enum FilterType {
  Last30Days = "last-30-days",
  Last7Days = "last-7-days",
}
const defaultFilter = FilterType.Last30Days;

type EntityCountDto = {
  entity: EntityWithDetailsDto;
  href?: string;
  count: number;
};
type LoaderData = {
  summary: EntityCountDto[];
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const searchParams = (await props.searchParams) || {};
  const headersList = await headers();
  const request = new Request("http://localhost", {
    headers: headersList,
  });
  const tenantId = await getTenantIdOrNull({ request, params });
  let entities: EntityWithDetailsDto[] = [];
  if (tenantId) {
    entities = await db.entities.getAllEntities(null);
  } else {
    entities = await db.entities.getAllEntities(null);
  }
  const userInfo = await getUserInfo();

  const rowWhere: Prisma.RowWhereInput = {};
  const countFilter = (searchParams.count as string) ?? defaultFilter;
  if (countFilter) {
    if (countFilter === "last-30-days") {
      rowWhere.createdAt = {
        gte: DateUtils.daysFromDate(new Date(), 30 * -1),
      };
    } else if (countFilter === "last-7-days") {
      rowWhere.createdAt = {
        gte: DateUtils.daysFromDate(new Date(), 7 * -1),
      };
    }
  }
  const summary: EntityCountDto[] = await Promise.all(
    entities.map(async (entity) => {
      return {
        entity,
        href: EntityHelper.getRoutes({ routes: getNoCodeRoutes({ request, params }), entity })?.list,
        count: await count({
          entity,
          tenantId,
          userId: userInfo.userId,
          rowWhere,
        }),
      };
    })
  );
  const data: LoaderData = {
    summary,
  };
  return data;
};

export default async function CountPage(props: IServerComponentsProps) {
  const data = await loader(props);
  return <CountPageComponent initialData={data} />;
}
