"use client";

import { useRouter, useParams } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Stripe from "stripe";
import { PlanFeatureUsageDto } from "@/lib/dtos/subscriptions/PlanFeatureUsageDto";
import MyBillingSession from "@/components/core/settings/subscription/MyBillingSession";
import MyInvoices from "@/components/core/settings/subscription/MyInvoices";
import MyPayments from "@/components/core/settings/subscription/MyPayments";
import MyProducts from "@/components/core/settings/subscription/MyProducts";
import MySubscriptionFeatures from "@/components/core/settings/subscription/MySubscriptionFeatures";
import MyUpcomingInvoice from "@/components/core/settings/subscription/MyUpcomingInvoice";
import SettingSection from "@/components/ui/sections/SettingSection";
import { TenantSubscriptionProductWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionProductsModel";
import { TenantSubscriptionWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionsModel";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import UrlUtils from "@/lib/utils/UrlUtils";

export default function SubscriptionSettings({
  currentTenant,
  mySubscription,
  myInvoices,
  myPayments,
  myFeatures,
  myUpcomingInvoices,
  permissions,
}: {
  currentTenant: TenantDto;
  mySubscription: TenantSubscriptionWithDetailsDto | null;
  myInvoices: Stripe.Invoice[];
  myPayments: Stripe.PaymentIntent[];
  myFeatures: PlanFeatureUsageDto[];
  myUpcomingInvoices: Stripe.Invoice[];
  permissions: {
    viewInvoices: boolean;
  };
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  async function onCancel(item: TenantSubscriptionProductWithDetailsDto) {
    const form = new FormData();
    form.set("action", "cancel");
    form.set("tenant-subscription-product-id", item.id);

    startTransition(async () => {
      try {
        const response = await fetch(window.location.pathname, {
          method: "POST",
          body: form,
        });

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else if (response.ok) {
          router.refresh();
        }
      } catch (error) {
        console.error("Error canceling subscription:", error);
      }
    });
  }

  // function onAddPaymentMethod() {
  //   const form = new FormData();
  //   form.set("action", "add-payment-method");
  //   startTransition(async () => {
  //     try {
  //       const response = await fetch(window.location.pathname, {
  //         method: "POST",
  //         body: form,
  //       });
  //
  //       if (response.ok) {
  //         router.refresh();
  //       }
  //     } catch (error) {
  //       console.error("Error adding payment method:", error);
  //     }
  //   });
  // }

  async function onOpenCustomerPortal() {
    const form = new FormData();
    form.set("action", "open-customer-portal");

    startTransition(async () => {
      try {
        const response = await fetch(window.location.pathname, {
          method: "POST",
          body: form,
        });

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else if (response.ok) {
          router.refresh();
        }
      } catch (error) {
        console.error("Error opening customer portal:", error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <SettingSection
        title={t("settings.subscription.title")}
        description={
          <div className="flex flex-col space-y-1">
            <div>{t("settings.subscription.description")}</div>
            <div>
              {mySubscription?.products && mySubscription.products.length > 0 && (
                <Link href={UrlUtils.currentTenantUrl(params, "pricing")} className="text-theme-600 underline">
                  {t("settings.subscription.viewAllProducts")}
                </Link>
              )}
            </div>
          </div>
        }
        className=""
      >
        <MyProducts currentTenant={currentTenant} items={mySubscription?.products ?? []} onCancel={onCancel} />
      </SettingSection>

      {myFeatures.length > 0 && (
        <>
          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-4">
              <div className="border-t border-border"></div>
            </div>
          </div>

          <SettingSection title={t("app.subscription.features.title")} description={t("app.subscription.features.description")} className="">
            <MySubscriptionFeatures features={myFeatures} withCurrentPlan={false} />
          </SettingSection>
        </>
      )}

      {permissions.viewInvoices && (
        <>
          <div className="hidden sm:block" aria-hidden="true">
            <div className="py-4">
              <div className="border-t border-border"></div>
            </div>
          </div>

          <SettingSection title={t("app.subscription.invoices.title")} description={t("app.subscription.invoices.description")}>
            <div className="space-y-2">
              <MyUpcomingInvoice items={myUpcomingInvoices} />
              <MyInvoices items={myInvoices} />
              <MyPayments items={myPayments} />
            </div>
          </SettingSection>
        </>
      )}

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-4">
          <div className="border-t border-border"></div>
        </div>
      </div>

      {/* <SettingSection title={t("app.subscription.paymentMethods.title")} description={t("app.subscription.paymentMethods.description")}>
          <div className="space-y-2">
            <MyPaymentMethods items={myPaymentMethods} onAdd={onAddPaymentMethod} onDelete={onDeletePaymentMethod} />
          </div>
        </SettingSection> */}

      <SettingSection title={t("app.subscription.billing.title")} description={t("app.subscription.billing.description")}>
        <div className="space-y-2">
          <MyBillingSession onClick={onOpenCustomerPortal} />
        </div>
      </SettingSection>
    </div>
  );
}
