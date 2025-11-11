import { redirect } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/db";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import UrlUtils from "@/utils/app/UrlUtils";
import PortalServer from "@/modules/portals/services/Portal.server";
import StripeConnectServer from "@/modules/portals/services/StripeConnect.server";
import PricingClient from "./pricing-client";
import Stripe from "stripe";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  return {
    title: `Pricing | ${process.env.APP_NAME}`,
  };
}

type LoaderData = {
  item: PortalWithDetailsDto;
  stripeAccount: Stripe.Account | null;
  items: SubscriptionProductDto[];
  portalUrl: string;
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const resolvedParams = await props.params;
  const params = resolvedParams || {};
  const request = props.request!;
  
  await requireAuth();
  
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.portals?.pricing) {
    throw Response.json({ error: "Pricing is not enabled" }, { status: 400 });
  }

  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await db.portals.getPortalById(tenantId, params.portal!);
  
  if (!item) {
    redirect(UrlUtils.getModulePath(params, "portals"));
  }
  
  let stripeAccount: Stripe.Account | null = null;
  try {
    stripeAccount = item.stripeAccountId ? await StripeConnectServer.getStripeAccount(item.stripeAccountId) : null;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error(e.message);
    await db.portals.updatePortal(item.id, {
      stripeAccountId: null,
    });
  }

  const portalUrl = PortalServer.getPortalUrl(item);
  const items = await db.portalSubscriptionProducts.getAllPortalSubscriptionProductsWithUsers(item.id);
  
  const data: LoaderData = {
    item,
    stripeAccount,
    items: items.sort((x, y) => {
      return x?.order > y?.order ? 1 : -1;
    }),
    portalUrl,
  };
  
  return data;
}

export default async function PricingPage(props: IServerComponentsProps) {
  const data = await getData(props);
  const resolvedParams = await props.params;
  const params = resolvedParams || {};

  return <PricingClient data={data} params={params} />;
}
