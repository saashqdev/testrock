import { getServerTranslations } from "@/i18n/server";
import { getUserInfo } from "@/lib/services/session.server";
import { createStripeCustomer } from "@/utils/stripe.server";
import { createCustom } from "./RowsApi";
import { setTenantTypes } from "./TenantTypesApi";
import EventsService from "@/modules/events/services/.server/EventsService";
import { AccountCreatedDto } from "@/modules/events/dtos/AccountCreatedDto";
import { autosubscribeToTrialOrFreePlan } from "@/utils/services/server/pricingService";
import { db } from "@/db";

export async function create({ request, form, name, slug }: { request: Request; form: FormData; name: string; slug?: string }) {
  const { t } = await getServerTranslations();
  let userInfo = await getUserInfo();
  const user = await db.users.getUser(userInfo.userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (!name) {
    throw new Error("Name is required");
  }

  let stripeCustomerId: string | undefined;
  if (process.env.STRIPE_SK) {
    const stripeCustomer = await createStripeCustomer(user?.email, name);
    if (!stripeCustomer) {
      throw new Error("Could not create Stripe customer");
    }
    stripeCustomerId = stripeCustomer.id;
  }
  const tenant = await db.tenants.createTenant({ name, subscriptionCustomerId: stripeCustomerId, slug });

  await db.users.updateUserDefaultTenantId({ defaultTenantId: tenant.id }, user.id);

  await autosubscribeToTrialOrFreePlan({ request, t, tenantId: tenant.id, userId: user.id });

  await EventsService.create({
    request,
    event: "account.created",
    tenantId: tenant.id,
    userId: user.id,
    data: {
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
      user: { id: user.id, email: user.email },
    } satisfies AccountCreatedDto,
  });

  const tenantSettingsEntity = await db.entities.findEntityByName({ tenantId: null, name: "tenantSettings" });
  if (tenantSettingsEntity) {
    try {
      await createCustom({
        request,
        entity: tenantSettingsEntity,
        tenantId: tenant.id,
        t,
        form,
        row: undefined,
      });
    } catch (e: any) {
      throw e;
    }
  }

  await setTenantTypes({ tenantId: tenant.id });

  return {
    redirectTo: `/app/${encodeURIComponent(tenant.slug)}/dashboard`,
    tenant,
    user,
  };
}

