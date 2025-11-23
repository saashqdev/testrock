"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { AppLoaderData } from "@/lib/state/useAppData";
import { CheckoutSessionResponse } from "@/utils/services/server/pricingService";

type LoaderData = AppLoaderData & {
  title: string;
  checkoutSession: CheckoutSessionResponse | null;
  error?: string;
};

export default function SubscribeSuccessView({ data, appConfiguration }: { data: LoaderData; appConfiguration: any }) {
  const { t } = useTranslation();

  return (
    <div>
      <div className="pt-20">
        <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
          <div className="flex shrink-0 justify-center">
            <Logo to={`/app/${data.currentTenant.slug}`} />
          </div>
          <div className="sm:align-center sm:flex sm:flex-col">
            <div className="relative mx-auto w-full max-w-xl overflow-hidden px-2 py-12 sm:py-6">
              <div className="text-center">
                {data.error ? (
                  <>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("shared.unexpectedError")}</h1>
                    <p className="mt-4 text-lg leading-6 text-red-500">{data.error}</p>
                  </>
                ) : !data.checkoutSession ? (
                  <>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("shared.error")}</h1>
                    <p className="mt-4 text-lg leading-6 text-red-500">{t("settings.subscription.checkout.invalid")}</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("settings.subscription.checkout.success.title")}</h1>
                    <p className="mt-4 text-lg leading-6 text-muted-foreground">
                      {t("settings.subscription.checkout.success.description", {
                        0: t(data.checkoutSession.products.map((f: any) => t(f.title)).join(", ")),
                      })}
                    </p>
                  </>
                )}

                <div className="mt-4">
                  <Link
                    className="focus:border-accent-300 shadow-2xs focus:outline-hidden inline-flex items-center space-x-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary focus:ring-2 dark:border-gray-800 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                    href={`${appConfiguration.app.features.tenantHome.replace(":tenant", data.currentTenant.slug)}settings/subscription`}
                  >
                    &larr; {t("settings.subscription.checkout.success.goToSubscription")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
