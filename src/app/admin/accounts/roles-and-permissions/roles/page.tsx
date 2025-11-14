import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { RoleWithPermissionsAndUsersDto } from "@/db/models/permissions/RolesModel";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { getFiltersFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import RolesClient from "./component";

type LoaderData = {
  title: string;
  items: RoleWithPermissionsAndUsersDto[];
  filterableProperties: FilterablePropertyDto[];
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const request = props.request!;
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.roles.view");
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "admin.roles-and-permissions.roles");
  let { t } = await getServerTranslations();

  const filterableProperties: FilterablePropertyDto[] = [
    { name: "name", title: "models.role.name" },
    { name: "description", title: "models.role.description" },
    {
      name: "permissionId",
      title: "models.permission.object",
      manual: true,
      options: (await time(db.permissions.getAllPermissionsIdsAndNames(), "getAllPermissionsIdsAndNames")).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const items = await time(db.roles.getAllRolesWithUsers(undefined, filters), "getAllRolesWithUsers");

  const data: LoaderData = {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
    items,
    filterableProperties,
  };
  return data;
}

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  
  return {
    title: `${t("models.role.plural")} | ${process.env.APP_NAME}`,
  };
}

export default async function RolesPage(props: IServerComponentsProps) {
  const data = await getData(props);
  return <RolesClient data={data} />;
}
