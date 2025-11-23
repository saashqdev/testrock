import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return defaultSeoMetaTags({
    title: `${t("models.subscription.object")} | ${getDefaultSiteTags.title}`,
  });
}

export default async function SubscriptionDetailPage(props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.account.settings.update");
  const params = (await props.params) || {};

  const item = await db.tenantSubscriptionProducts.getTenantSubscriptionProductById(params.id!);
  if (!item) {
    notFound();
  }

  return <Component data={item} />;
}
