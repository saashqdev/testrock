import { NextRequest, NextResponse } from "next/server";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { db } from "@/db";
import { createStripeCheckoutSession, createStripeCustomer } from "@/utils/stripe.server";
import SubscriptionHelper from "@/lib/helpers/SubscriptionHelper";
import { getBaseURL } from "@/utils/url.server";
import { getServerTranslations } from "@/i18n/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { t } = await getServerTranslations();
    const resolvedParams = await params;
    
    console.log("Subscribe API - Tenant params:", resolvedParams);
    
    const tenantId = await getTenantIdFromUrl(resolvedParams);
    console.log("Subscribe API - Tenant ID:", tenantId);
    
    if (!tenantId) {
      console.error("Subscribe API - Tenant not found");
      return NextResponse.json({ error: "Tenant not found" }, { status: 400 });
    }

    const userInfo = await getUserInfo();
    console.log("Subscribe API - User info:", userInfo);
    
    if (!userInfo?.userId) {
      console.error("Subscribe API - Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const actionType = formData.get("action")?.toString();
    
    console.log("Subscribe API - Action type:", actionType);
    console.log("Subscribe API - Form data:", Object.fromEntries(formData.entries()));

    if (actionType !== "subscribe") {
      console.error("Subscribe API - Invalid action");
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const tenantSubscription = await db.tenantSubscriptions.getOrPersistTenantSubscription(tenantId);
    const user = await db.users.getUser(userInfo.userId);
    const tenant = await db.tenants.getTenant(tenantId);

    if (!user || !tenant) {
      return NextResponse.json({ error: "User or tenant not found" }, { status: 400 });
    }

    // Create Stripe customer if doesn't exist
    if (!tenantSubscription.stripeCustomerId) {
      const customer = await createStripeCustomer(user.email, tenant.name);
      if (customer) {
        tenantSubscription.stripeCustomerId = customer.id;
        await db.tenantSubscriptions.updateTenantSubscriptionCustomerId(tenant.id, {
          stripeCustomerId: customer.id,
        });
      }
    }

    if (!tenantSubscription?.stripeCustomerId) {
      return NextResponse.json({
        error: "Invalid stripe customer: " + (tenantSubscription?.stripeCustomerId || "empty"),
      }, { status: 400 });
    }

    try {
      console.log("Subscribe API - Getting plan from form...");
      const selectedPlan = await SubscriptionHelper.getPlanFromForm(formData);
      console.log("Subscribe API - Selected plan:", selectedPlan.product.title);
      
      const baseURL = await getBaseURL();
      console.log("Subscribe API - Base URL:", baseURL);
      
      const successUrl = `${baseURL}/subscribe/${resolvedParams.tenant}/{CHECKOUT_SESSION_ID}/success`;
      const cancelUrl = `${baseURL}/subscribe/${resolvedParams.tenant}`;
      
      console.log("Subscribe API - Success URL:", successUrl);
      console.log("Subscribe API - Cancel URL:", cancelUrl);
      console.log("Subscribe API - Creating Stripe checkout session...");
      
      const session = await createStripeCheckoutSession({
        subscriptionProduct: selectedPlan.product,
        customer: tenantSubscription.stripeCustomerId,
        line_items: selectedPlan.line_items,
        mode: selectedPlan.mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        freeTrialDays: selectedPlan.freeTrialDays,
        coupon: selectedPlan.coupon,
        referral: selectedPlan.referral,
      });

      if (!session || !session.url) {
        console.error("Subscribe API - No session URL returned");
        return NextResponse.json({
          error: "Could not create checkout session",
        }, { status: 400 });
      }

      console.log("Subscribe API - Success! Checkout URL:", session.url);
      // Return the Stripe checkout URL for the client to navigate to
      return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (e: any) {
      console.error("Subscribe API - Stripe session error:", e);
      return NextResponse.json({ error: e.message || "Failed to create checkout session" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Subscription error:", error);
    return NextResponse.json({ 
      error: error.message || "An error occurred processing your request" 
    }, { status: 500 });
  }
}
