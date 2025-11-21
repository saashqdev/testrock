import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getUserInfo } from "@/lib/services/session.server";
import { AppLoaderData } from "@/lib/state/useAppData";
import { loadAppData } from "@/lib/state/server/appData";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { addTenantProductsFromCheckoutSession, CheckoutSessionResponse, getAcquiredItemsFromCheckoutSession } from "@/utils/services/server/pricingService";
import { persistCheckoutSessionStatus } from "@/utils/services/server/subscriptionService";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import SubscribeSuccessView from "./component";

type LoaderData = AppLoaderData & {
  title: string;
  checkoutSession: CheckoutSessionResponse | null;
  error?: string;
};

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "subscribe.$tenant.$session.success");
  let { t } = await getServerTranslations();
  const tenantId = await time(getTenantIdFromUrl(params), "getTenantIdFromUrl");
  const userInfo = await time(getUserInfo(), "getUserInfo");

  const user = await time(db.users.getUser(userInfo.userId), "getUser");
  if (!user) {
    throw redirect(`/login`);
  }
  const tenant = await time(db.tenants.getTenant(tenantId), "getTenant");
  if (!tenant) {
    throw redirect(`/app`);
  }

  await time(
    persistCheckoutSessionStatus({
      request,
      id: params.session ?? "",
      fromUrl: new URL(request.url).pathname,
      fromUserId: user.id,
      fromTenantId: tenant.id,
    }),
    "persistCheckoutSessionStatus"
  );
  const checkoutSession = await time(getAcquiredItemsFromCheckoutSession(params.session ?? ""), "getAcquiredItemsFromCheckoutSession");

  const appData = await time(loadAppData({ request, params, t, time }), "loadAppData");
  const data: LoaderData = {
    title: `${t("pricing.subscribe")} | ${process.env.APP_NAME}`,
    ...appData,
    checkoutSession,
  };

  if (checkoutSession) {
    try {
      await time(
        addTenantProductsFromCheckoutSession({
          request,
          tenantId: tenantId,
          user,
          checkoutSession,
          createdUserId: null,
          createdTenantId: null,
          t,
        }),
        "addTenantProductsFromCheckoutSession"
      );
      await Promise.all(
        checkoutSession.products.map(async (product) => {
          await db.logs.createLog(request, tenantId, "Subscribed", t(product.title ?? ""));
        })
      );
      return data;
      // return redirect(`/subscribe/${params.tenant}/${params.product}/success`);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.log(e);
      return { ...data, error: e.message };
    }
  }
  return data;
};

export async function generateMetadata(props: IServerComponentsProps) {
  const data = await loader(props);
  return {
    title: data.title,
  };
}

export default async function SubscribeSuccessPage(props: IServerComponentsProps) {
  const data = await loader(props);
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  return <SubscribeSuccessView data={data} appConfiguration={appConfiguration} />;
}
