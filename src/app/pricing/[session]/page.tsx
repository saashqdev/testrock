import { useTranslation } from "react-i18next";
import Logo from "@/components/brand/Logo";
import { getServerTranslations } from "@/i18n/server";
import { addTenantProductsFromCheckoutSession, CheckoutSessionResponse, getAcquiredItemsFromCheckoutSession } from "@/utils/services/server/pricingService";
import { createUserSession, getUserInfo, setLoggedUser } from "@/lib/services/session.server";
import { RegisterForm } from "@/modules/users/components/RegisterForm";
import { getRegistrationFormData, validateRegistration } from "@/utils/services/authService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { Metadata } from "next";

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

  return (
    <PricingSubscribedSuccessClient 
      data={data} 
      action={handleRegistration}
    />
  );
}

function PricingSubscribedSuccessClient({ 
  data, 
  action 
}: { 
  data: LoaderData; 
  action: (prevState: ActionData | null, formData: FormData) => Promise<ActionData>;
}) {
  "use client";
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { useActionState, useEffect } = require("react");
  const { t } = useTranslation();
  const [actionData, formAction] = useActionState(action, null);

  useEffect(() => {
    try {
      // @ts-ignore
      $crisp.push(["do", "chat:hide"]);
    } catch {
      // ignore
    }
  }, []);

  return (
    <div>
      <div className="">
        <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-sm space-y-5">
            <Logo className="mx-auto h-12 w-auto" />

            <div className="flex flex-col items-center">
              {data.error ? (
                <>
                  <h1 className="text-left text-2xl font-extrabold">Unexpected Error</h1>
                  <p className="mt-1 text-center text-sm text-red-500">{data.error}</p>
                </>
              ) : !data.checkoutSession ? (
                <>
                  <h1 className="text-left text-2xl font-extrabold">Error</h1>
                  <p className="mt-1 text-center text-sm text-red-500">Invalid checkout session</p>
                </>
              ) : (
                <>
                  <h1 className="text-left text-2xl font-extrabold">{t("account.register.setup")}</h1>
                  <p className="mt-1 text-center text-sm">Thank you for subscribing to {t(data.checkoutSession.products.map((f) => t(f.title)).join(", "))}</p>
                </>
              )}
            </div>

            {data.checkoutSession && !data.error && (
              <RegisterForm
                data={{
                  company: actionData?.fields?.company,
                  firstName: actionData?.fields?.firstName,
                  lastName: actionData?.fields?.lastName,
                  email: data.checkoutSession.customer.email,
                }}
                error={actionData?.error}
                isSettingUpAccount={true}
                action={formAction}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
