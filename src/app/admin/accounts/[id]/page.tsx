import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { redirect } from "next/navigation";
import { db } from "@/db";
import Component from "./component";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.tenant.object")} | ${defaultSiteTags.title}`,
  });
}

export default async function TenantDetailPage(props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.account.view");
  const params = (await props.params) || {};
  const { t } = await getServerTranslations();

  const tenant = await db.tenants.getTenant(params.id!);
  if (!tenant) {
    redirect("/admin/accounts");
  }

  const users = await db.users.adminGetAllTenantUsers(tenant.id);
  const subscription = await db.tenantSubscriptions.getTenantSubscription(params.id!);
  const subscriptionProducts = await db.subscriptionProducts.getAllSubscriptionProducts();
  const tenantSettingsEntity = await db.entities.findEntityByName({ tenantId: null, name: "tenantSettings" });
  const tenantTypes = await db.tenantTypes.getAllTenantTypes();

  return (
    <Component
      tenant={tenant}
      users={users}
      subscription={subscription}
      subscriptionProducts={subscriptionProducts}
      isStripeTest={process.env.STRIPE_SK?.toString().startsWith("sk_test_") ?? true}
      tenantSettingsEntity={tenantSettingsEntity}
      tenantTypes={tenantTypes}
    />
  );
}
