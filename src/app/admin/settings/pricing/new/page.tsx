import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  const siteTags = getDefaultSiteTags();
  return {
    title: `${t("admin.pricing.new")} | ${siteTags.title}`,
  };
}

const loader = async () => {
  await verifyUserHasPermission("admin.pricing.create");
  const items = await db.subscriptionProducts.getAllSubscriptionProducts();
  return { plans: items };
};

export default async function () {
  const data = await loader();
  return <Component plans={data.plans} />;
}
