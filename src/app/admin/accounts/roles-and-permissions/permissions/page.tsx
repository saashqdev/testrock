import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { PermissionsWithRolesDto } from "@/db/models";
import { getFiltersFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import PermissionsClient from "@/app/admin/accounts/roles-and-permissions/permissions/component";

type LoaderData = {
  title: string;
  items: PermissionsWithRolesDto[];
  filterableProperties: FilterablePropertyDto[];
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const request = props.request!;
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.roles.view");
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "admin.roles-and-permissions.permissions");
  let { t } = await getServerTranslations();

  const filterableProperties: FilterablePropertyDto[] = [
    { name: "name", title: "models.role.name" },
    { name: "description", title: "models.role.description" },
    {
      name: "roleId",
      title: "models.role.object",
      manual: true,
      options: (await time(db.roles.getAllRolesNames(), "getAllRolesNames")).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const items = await time(db.permissions.getAllPermissions(undefined, filters), "getAllPermissions");

  const data: LoaderData = {
    title: `${t("models.permission.plural")} | ${process.env.APP_NAME}`,
    items,
    filterableProperties,
  };
  return data;
}

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  
  return {
    title: `${t("models.permission.plural")} | ${process.env.APP_NAME}`,
  };
}

export default async function PermissionsPage(props: IServerComponentsProps) {
  const data = await getData(props);
  return <PermissionsClient data={data} />;
}
