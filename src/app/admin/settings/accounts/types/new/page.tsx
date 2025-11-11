import { redirect } from "next/navigation";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { TenantTypeForm } from "@/components/core/tenants/types/TenantTypeForm";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { db } from "@/db";

type PageData = {
  allSubscriptionProducts: SubscriptionProductDto[];
};

async function getPageData(): Promise<PageData> {
  await verifyUserHasPermission("admin.accountTypes.create");
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.app.features.tenantTypes) {
    throw Error("Tenant Types are not enabled (appConfiguration.app.features.tenantTypes)");
  }
  const data: PageData = {
    allSubscriptionProducts: await db.subscriptionProducts.getAllSubscriptionProducts(),
  };
  return data;
}

export async function createTenantType(formData: FormData) {
  "use server";
  
  await verifyUserHasPermission("admin.accountTypes.create");
  const { t } = await getServerTranslations();
  const action = formData.get("action")?.toString();

  if (action === "create") {
    const title = formData.get("title")?.toString().trim();
    const titlePlural = formData.get("titlePlural")?.toString().trim();
    const description = formData.get("description")?.toString() || null;
    const isDefault = Boolean(formData.get("isDefault"));
    const subscriptionProducts = formData.getAll("subscriptionProducts[]").map((f) => f.toString());

    if (!title || !titlePlural) {
      return { error: t("shared.invalidForm") };
    }
    const existing = await db.tenantTypes.getTenantTypeByTitle(title);
    if (existing) {
      return { error: t("shared.alreadyExists") };
    }
    await db.tenantTypes.createTenantType({
      title,
      titlePlural,
      description,
      isDefault,
      subscriptionProducts,
    });
    redirect("/admin/settings/accounts/types");
  } else {
    return { error: t("shared.invalidForm") };
  }
}

export default async function NewTenantTypePage() {
  const data = await getPageData();
  return (
    <div>
      <TenantTypeForm 
        allSubscriptionProducts={data.allSubscriptionProducts}
        action={createTenantType}
      />
    </div>
  );
}
