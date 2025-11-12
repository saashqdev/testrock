import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { db } from "@/db";
import Component from "./component";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.blacklist.object")} | ${defaultSiteTags.title}`,
  });
}

export default async function BlacklistPage(props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.blacklist.view");
  const { t } = await getServerTranslations();
  const searchParams = await props.searchParams;

  const urlSearchParams = new URLSearchParams(searchParams as Record<string, string>);
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await db.blacklist.getBlacklist(undefined, currentPagination);

  return <Component items={items} pagination={pagination} />;
}
