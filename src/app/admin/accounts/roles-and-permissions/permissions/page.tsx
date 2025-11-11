import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { getFiltersFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.permission.plural")} | ${defaultSiteTags.title}`,
  });
}

export default async function PermissionsPage(props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.roles.view");
  const { t } = await getServerTranslations();
  const request = props.request!;

  const filterableProperties: FilterablePropertyDto[] = [
    { name: "name", title: "models.role.name" },
    { name: "description", title: "models.role.description" },
    {
      name: "roleId",
      title: "models.role.object",
      manual: true,
      options: (await db.roles.getAllRolesNames()).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
  ];
  
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const items = await db.permissions.getAllPermissions(undefined, filters);

  return <Component items={items} filterableProperties={filterableProperties} />;
}
