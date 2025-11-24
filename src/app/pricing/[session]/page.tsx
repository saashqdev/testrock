import { getServerTranslations } from "@/i18n/server";
import { addTenantProductsFromCheckoutSession, CheckoutSessionResponse, getAcquiredItemsFromCheckoutSession } from "@/utils/services/server/pricingService";
import { createUserSession, getUserInfo, setLoggedUser } from "@/lib/services/session.server";
import { getRegistrationFormData, validateRegistration } from "@/utils/services/authService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { Metadata } from "next";
import { PricingSubscribedSuccessClient } from "./component";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("account.register.setup")} | ${process.env.APP_NAME}`,
  };
}

type LoaderData = {
  title: string;
  checkoutSession: CheckoutSessionResponse | null;
  error?: string;
};

async function loadData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const { t } = await getServerTranslations();

  const checkoutSession = await getAcquiredItemsFromCheckoutSession(params.session ?? "");
  const data: LoaderData = {
    title: `${t("account.register.setup")} | ${process.env.APP_NAME}`,
    checkoutSession,
  };

  if (!checkoutSession) {
    return { ...data, error: t("settings.subscription.checkout.invalid") };
  } else if (!checkoutSession.status?.pending) {
    return { ...data, error: t("settings.subscription.checkout.alreadyProcessed") };
  }

  return data;
}

type ActionData = {
  error?: string;
  fieldErrors?: {
    email: string | undefined;
    password: string | undefined;
  };
  fields?: {
    email: string;
    password: string;
    company: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
  };
};

export default async function PricingSubscribedSuccessRoute(props: IServerComponentsProps) {
  const params = await props.params;
  const { t } = await getServerTranslations();

  // Load data
  const data = await loadData(props);

  // Server Action for form submission
  async function handleRegistration(prevState: ActionData | null, formData: FormData): Promise<ActionData> {
    "use server";

    const { t } = await getServerTranslations();
    const userInfo = await getUserInfo();
    const resolvedParams = (await props.params) || {};

    const checkoutSession = await getAcquiredItemsFromCheckoutSession(resolvedParams.session ?? "");
    if (!checkoutSession) {
      return { error: t("settings.subscription.checkout.invalid") };
    } else if (!checkoutSession.status?.pending) {
      return { error: t("settings.subscription.checkout.alreadyProcessed") };
    } else if (!checkoutSession.customer?.id) {
      return { error: t("settings.subscription.checkout.invalidCustomer") };
    }

    try {
      const request = new Request("http://localhost", {
        method: "POST",
        body: formData,
      });

      const registrationData = await getRegistrationFormData(request);
      const result = await validateRegistration({
        request,
        registrationData,
        addToTrialOrFreePlan: false,
        checkEmailVerification: false,
        stripeCustomerId: checkoutSession.customer.id,
      });

      if (!result.registered) {
        return { error: t("shared.unknownError") };
      }

      const tenantId = result.registered.tenant.id;
      await addTenantProductsFromCheckoutSession({
        request,
        tenantId,
        user: result.registered.user,
        checkoutSession,
        createdUserId: result.registered.user.id,
        createdTenantId: result.registered.tenant.id,
        t,
      });

      await Promise.all(
        checkoutSession.products.map(async (product) => {
          await db.logs.createLog(request, tenantId, "Subscribed", t(product.title ?? ""));
        })
      );

      const userSession = await setLoggedUser(result.registered.user);
      await createUserSession(
        {
          ...userInfo,
          ...userSession,
          lng: result.registered.user.locale ?? userInfo.lng,
        },
        `/app/${result.registered.tenant.slug}/dashboard`
      );

      return {};
    } catch (e: any) {
      return { error: e.message };
    }
  }

  return <PricingSubscribedSuccessClient data={data} action={handleRegistration} />;
}
