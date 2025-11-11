import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { getFiltersFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.role.plural")} | ${defaultSiteTags.title}`,
  });
}

export default async function RolesPage(props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.roles.view");
  const { t } = await getServerTranslations();
  const request = props.request!;

  const filterableProperties: FilterablePropertyDto[] = [
    { name: "name", title: "models.role.name" },
    { name: "description", title: "models.role.description" },
    {
      name: "permissionId",
      title: "models.permission.object",
      manual: true,
      options: (await db.permissions.getAllPermissionsIdsAndNames()).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
  ];
  
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const items = await db.roles.getAllRolesWithUsers(undefined, filters);

  return <Component items={items} filterableProperties={filterableProperties} />;
}
