"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createCustomerPortalSession,
  createStripeSetupSession,
  deleteStripePaymentMethod,
} from "@/utils/stripe.server";
import { getUserInfo } from "@/lib/services/session.server";
import { getServerTranslations } from "@/i18n/server";
import { cancelTenantSubscription } from "@/utils/services/server/subscriptionService";
import { db } from "@/db";
import { headers } from "next/headers";

type ActionResult = {
  error?: string;
  success?: string;
  url?: string;
};

async function getTenantAndValidate() {
  const { t } = await getServerTranslations();
  const userInfo = await getUserInfo();

  const user = await db.users.getUser(userInfo.userId);
  if (!user) {
    throw new Error("Invalid user");
  }

  const myTenants = await db.tenants.getMyTenants(userInfo.userId);
  if (myTenants.length === 0) {
    redirect("/settings/profile");
  }

  const tenantId = myTenants[0].id;
  const tenantSubscription = await db.tenantSubscriptions.getTenantSubscription(tenantId);

  if (!tenantSubscription || !tenantSubscription?.stripeCustomerId) {
    throw new Error("Invalid stripe customer");
  }

  return { t, userInfo, tenantId, tenantSubscription };
}

export async function cancelSubscriptionAction(formData: FormData): Promise<ActionResult> {
  try {
    const { t, userInfo, tenantId } = await getTenantAndValidate();
    const tenantSubscriptionProductId = formData.get("tenant-subscription-product-id")?.toString() ?? "";

    await cancelTenantSubscription(tenantSubscriptionProductId, { t, tenantId, userId: userInfo.userId });
    revalidatePath("/settings/subscription");
    return { success: "Successfully cancelled" };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function addPaymentMethodAction(): Promise<ActionResult> {
  try {
    const { tenantSubscription } = await getTenantAndValidate();
    if (!tenantSubscription.stripeCustomerId) {
      return { error: "No Stripe customer ID found" };
    }

    const headersList = await headers();
    const origin = headersList.get("origin") || headersList.get("referer") || "";
    
    // Create a mock request object for the session creation
    const mockRequest = new Request(origin + "/settings/subscription", {
      headers: headersList,
    });

    const session = await createStripeSetupSession(mockRequest, tenantSubscription.stripeCustomerId);
    if (session?.url) {
      return { url: session.url };
    }
    return { error: "Failed to create setup session" };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deletePaymentMethodAction(formData: FormData): Promise<ActionResult> {
  try {
    await getTenantAndValidate();
    const paymentMethodId = formData.get("id")?.toString() ?? "";
    await deleteStripePaymentMethod(paymentMethodId);
    revalidatePath("/settings/subscription");
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function openCustomerPortalAction(): Promise<ActionResult> {
  try {
    const { tenantSubscription } = await getTenantAndValidate();
    if (!tenantSubscription.stripeCustomerId) {
      return { error: "No Stripe customer ID found" };
    }

    const headersList = await headers();
    const origin = headersList.get("origin") || headersList.get("referer") || "";
    
    // Create a mock request object for the session creation
    const mockRequest = new Request(origin + "/settings/subscription", {
      headers: headersList,
    });

    const session = await createCustomerPortalSession(mockRequest, tenantSubscription.stripeCustomerId);
    if (session?.url) {
      return { url: session.url };
    }
    return { error: "Failed to create portal session" };
  } catch (e: any) {
    return { error: e.message };
  }
}
