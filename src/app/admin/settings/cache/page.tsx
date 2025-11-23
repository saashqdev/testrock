import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import Component from "./component";
import { CachedValue, getCachedValues } from "@/lib/services/cache.server";
import { UserDto } from "@/db/models";
import { db } from "@/db";
import { defaultAppConfiguration } from "@/modules/core/data/defaultAppConfiguration";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return defaultSeoMetaTags({
    title: `${t("settings.admin.cache.title")} | ${getDefaultSiteTags.title}`,
  });
}

export type CacheLoaderData = {
  cachedValues: CachedValue[];
  allTenants: { id: string; name: string; slug: string }[];
  allUsers: UserDto[];
  cacheEnabled: boolean;
};
const loader = async () => {
  await verifyUserHasPermission("admin.settings.general.update");
  const { t } = await getServerTranslations();
  const cachedValues = await getCachedValues();

  const allTenants = await db.tenants.adminGetAllTenantsIdsAndNames();
  const allUsers = await db.users.getAll();

  const data: CacheLoaderData = {
    cachedValues,
    allTenants,
    allUsers,
    cacheEnabled: !!defaultAppConfiguration.app.cache,
  };
  return data;
};

export default async function () {
  const data = await loader();
  return <Component data={data} />;
}
