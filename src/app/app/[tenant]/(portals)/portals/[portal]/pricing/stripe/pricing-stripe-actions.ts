"use server";

import { db } from "@/db";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getUserInfo } from "@/lib/services/session.server";
import StripeConnectServer from "@/modules/portals/services/StripeConnect.server";
import { revalidatePath } from "next/cache";

type ActionResult = {
  error?: string;
  success?: string;
  redirectUrl?: string;
};

export async function connectStripeAction(country: string, portalSubdomain: string): Promise<ActionResult> {
  try {
    await requireAuth();

    const userInfo = await getUserInfo();
    if (!userInfo?.userId) {
      return { error: "Not authenticated" };
    }

    const portal = await db.portals.getPortalBySubdomain(portalSubdomain);
    if (!portal) {
      return { error: "Portal not found" };
    }

    const user = await db.users.getUser(userInfo.userId);
    if (!user) {
      return { error: "User not found" };
    }

    // Create Stripe account
    const account = await StripeConnectServer.createStripeAccount({
      email: user.email,
      country,
      metadata: {
        portalId: portal.id,
      },
    });

    // Update portal with Stripe account ID
    await db.portals.updatePortal(portal.id, {
      stripeAccountId: account.id,
    });

    // Create account link for onboarding
    const returnUrl = `${process.env.SERVER_URL}/app/${portalSubdomain}/pricing/stripe`;
    const refreshUrl = `${process.env.SERVER_URL}/app/${portalSubdomain}/pricing/stripe`;

    const accountLink = await StripeConnectServer.createStripeAccountLink({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
    });

    return { redirectUrl: accountLink.url };
  } catch (error: any) {
    return { error: error.message || "Failed to connect Stripe" };
  }
}

export async function reconnectStripeAction(portalSubdomain: string): Promise<ActionResult> {
  try {
    await requireAuth();

    const portal = await db.portals.getPortalBySubdomain(portalSubdomain);
    if (!portal || !portal.stripeAccountId) {
      return { error: "Portal or Stripe account not found" };
    }

    // Create account link for re-onboarding
    const returnUrl = `${process.env.SERVER_URL}/app/${portalSubdomain}/pricing/stripe`;
    const refreshUrl = `${process.env.SERVER_URL}/app/${portalSubdomain}/pricing/stripe`;

    const accountLink = await StripeConnectServer.createStripeAccountLink({
      account: portal.stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
    });

    return { redirectUrl: accountLink.url };
  } catch (error: any) {
    return { error: error.message || "Failed to reconnect Stripe" };
  }
}

export async function deleteStripeAction(portalSubdomain: string): Promise<ActionResult> {
  try {
    await requireAuth();

    const portal = await db.portals.getPortalBySubdomain(portalSubdomain);
    if (!portal || !portal.stripeAccountId) {
      return { error: "Portal or Stripe account not found" };
    }

    // Delete Stripe account
    await StripeConnectServer.deleteStripeAccount(portal.stripeAccountId);

    // Update portal to remove Stripe account ID
    await db.portals.updatePortal(portal.id, {
      stripeAccountId: null,
    });

    revalidatePath(`/app/${portalSubdomain}/pricing`);

    return { success: "Stripe account disconnected successfully" };
  } catch (error: any) {
    return { error: error.message || "Failed to disconnect Stripe" };
  }
}
