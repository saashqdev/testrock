"use client";

import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PlansGrouped from "@/components/core/settings/subscription/plans/PlansGrouped";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import ErrorModal, { RefErrorModal } from "@/components/ui/modals/ErrorModal";
import { useEffect, useRef } from "react";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import Stripe from "stripe";
import { SubscriptionBillingPeriod } from "@/lib/enums/subscriptions/SubscriptionBillingPeriod";
import { AppLoaderData } from "@/lib/state/useAppData";

type LoaderData = AppLoaderData & {
  title: string;
  items: SubscriptionProductDto[];
  coupon?: { error?: string; stripeCoupon?: Stripe.Coupon | null };
  currenciesAndPeriod: {
    currencies: { value: string; options: string[] };
    billingPeriods: { value: SubscriptionBillingPeriod; options: SubscriptionBillingPeriod[] };
  };
};

type ActionData = {
  error?: string;
  success?: string;
};

export default function SubscribeView({ data, actionData }: { data: LoaderData; actionData?: ActionData }) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const errorModal = useRef<RefErrorModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
  }, [actionData]);

  function canSubscribe() {
    return getUserHasPermission(data, "app.settings.subscription.update");
  }

  return (
    <div>
      <div className="pt-4">
        <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
          <div className="flex shrink-0 justify-center">
            <div className="mt-4 flex">
              <Link href={`/app/${data.currentTenant.slug}/settings/subscription`} className="w-full text-center text-sm font-medium hover:underline">
                <span aria-hidden="true"> &larr;</span> {t(t("settings.subscription.goToSubscription"))}
              </Link>
            </div>
          </div>
          <div className="sm:align-center sm:flex sm:flex-col">
            <div className="relative mx-auto w-full max-w-7xl space-y-4 overflow-hidden px-2 py-12 sm:py-6">
              <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("front.pricing.title")}</h1>
                <p className="mt-4 text-lg leading-6 text-muted-foreground">
                  {searchParams.get("error")?.toString() === "subscription_required" ? (
                    <span className="text-red-500">{t("pricing.required")}</span>
                  ) : (
                    <span>{t("front.pricing.headline")}</span>
                  )}
                </p>
              </div>
              {data?.items && (
                <PlansGrouped
                  items={data.items}
                  canSubmit={canSubscribe()}
                  tenantSubscription={data.mySubscription}
                  stripeCoupon={data.coupon?.stripeCoupon || null}
                  currenciesAndPeriod={data.currenciesAndPeriod}
                />
              )}
              <ErrorModal ref={errorModal} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
