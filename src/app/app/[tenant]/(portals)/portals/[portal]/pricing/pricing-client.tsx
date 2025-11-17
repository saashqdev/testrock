"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import Stripe from "stripe";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { Colors } from "@/lib/enums/shared/Colors";
import { PricingModel } from "@/lib/enums/subscriptions/PricingModel";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import GearIcon from "@/components/ui/icons/GearIcon";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import UrlUtils from "@/utils/app/UrlUtils";

type PricingClientProps = {
  data: {
    item: PortalWithDetailsDto;
    stripeAccount: Stripe.Account | null;
    items: SubscriptionProductDto[];
    portalUrl: string;
  };
  params: any;
};

export default function PricingClient({ data, params }: PricingClientProps) {
  const { t } = useTranslation();

  return (
    <EditPageLayout
      title="Pricing"
      withHome={false}
      buttons={
        <>
          <ButtonSecondary to="stripe">
            <GearIcon className="h-4 w-4" />
          </ButtonSecondary>
          <ButtonSecondary to={`${data.portalUrl}/pricing`} target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <div>{t("shared.preview")}</div>
          </ButtonSecondary>
          <ButtonPrimary to="new">{t("shared.new")}</ButtonPrimary>
        </>
      }
      menu={[
        {
          title: data.item.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}`),
        },
        {
          title: "Pricing",
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}/pricing`),
        },
      ]}
    >
      {data.stripeAccount === null ? (
        <WarningBanner title="Stripe not Connected">
          You don&apos;t have a Stripe account connected.{" "}
          <Link href={UrlUtils.getModulePath(params, `portals/${params.portal}/pricing/stripe`)} className="underline">
            Click here to connect your Stripe account.
          </Link>
        </WarningBanner>
      ) : !data.stripeAccount.charges_enabled ? (
        <WarningBanner title="Stripe Integration Pending">
          Your Stripe integration is pending.{" "}
          <Link href={UrlUtils.getModulePath(params, `portals/${params.portal}/pricing/stripe`)} className="underline">
            Click here to continue.
          </Link>
        </WarningBanner>
      ) : null}
      <div>
        <TableSimple
          items={data.items as (SubscriptionProductDto & { id: string })[]}
          headers={[
            {
              name: "order",
              title: t("models.subscriptionProduct.order"),
              value: (i) => i.order,
            },
            {
              name: "title",
              title: t("models.subscriptionProduct.title"),
              value: (item) => (
                <>
                  {t(item.title)}{" "}
                  {item.badge && <span className=" border-border bg-theme-50 text-theme-800 ml-1 rounded-md border px-1 py-0.5 text-xs">{t(item.badge)}</span>}
                </>
              ),
            },
            {
              name: "model",
              title: t("models.subscriptionProduct.model"),
              value: (item) => <>{t("pricing." + PricingModel[item.model])}</>,
            },
            {
              name: "subscriptions",
              title: t("models.subscriptionProduct.plural"),
              value: (item) => (
                <div className=" text-muted-foreground lowercase">
                  {item.tenantProducts?.length ?? 0} {t("shared.active")}
                </div>
              ),
            },
            {
              name: "active",
              title: t("models.subscriptionProduct.status"),
              value: (item) => (
                <>
                  {item.active ? (
                    <>
                      {item.public ? (
                        <SimpleBadge title={t("models.subscriptionProduct.public")} color={Colors.TEAL} />
                      ) : (
                        <SimpleBadge title={t("models.subscriptionProduct.custom")} color={Colors.ORANGE} />
                      )}
                    </>
                  ) : (
                    <SimpleBadge title={t("shared.inactive")} color={Colors.RED} />
                  )}
                </>
              ),
            },
            {
              name: "actions",
              title: t("shared.actions"),
              value: (item) => (
                <div className="flex items-center space-x-2">
                  <ButtonTertiary disabled={!item.id} to={"edit/" + item.id}>
                    {t("shared.edit")}
                  </ButtonTertiary>
                </div>
              ),
            },
          ]}
        />
      </div>
    </EditPageLayout>
  );
}
