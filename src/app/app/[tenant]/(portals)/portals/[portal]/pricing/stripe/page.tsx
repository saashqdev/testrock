import { redirect } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/db";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import UrlUtils from "@/utils/app/UrlUtils";
import StripeConnectServer from "@/modules/portals/services/StripeConnect.server";
import Stripe from "stripe";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import PricingStripeClient from "./pricing-stripe-client";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  return {
    title: `Connect Stripe | ${process.env.APP_NAME}`,
  };
}

type PageData = {
  item: PortalWithDetailsDto;
  stripeAccount: Stripe.Account | null;
};

export default async function PricingStripePage(props: IServerComponentsProps) {
  const resolvedParams = await props.params;
  const params = resolvedParams || {};
  const request = props.request!;

  await requireAuth();

  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.portals?.pricing) {
    throw new Error("Pricing is not enabled");
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

  const data: PageData = {
    item,
    stripeAccount,
  };

  return <PricingStripeClient data={data} params={params} />;
}
