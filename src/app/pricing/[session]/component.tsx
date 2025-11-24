"use client";

import { useActionState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Logo from "@/components/brand/Logo";
import { RegisterForm } from "@/modules/users/components/RegisterForm";
import { CheckoutSessionResponse } from "@/utils/services/server/pricingService";

type LoaderData = {
  title: string;
  checkoutSession: CheckoutSessionResponse | null;
  error?: string;
};

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

export function PricingSubscribedSuccessClient({
  data,
  action,
}: {
  data: LoaderData;
  action: (prevState: ActionData | null, formData: FormData) => Promise<ActionData>;
}) {
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
