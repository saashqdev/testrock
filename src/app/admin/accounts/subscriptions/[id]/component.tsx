"use client";

import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { SubscriptionBillingPeriod } from "@/lib/enums/subscriptions/SubscriptionBillingPeriod";
import InputGroup from "@/components/ui/forms/InputGroup";
import InputText from "@/components/ui/input/InputText";
import { TenantSubscriptionProductWithTenantDto } from "@/db/models/subscriptions/TenantSubscriptionProductsModel";
import DateUtils from "@/lib/shared/DateUtils";

interface ComponentProps {
  data: TenantSubscriptionProductWithTenantDto;
}

export default function Component({ data }: ComponentProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <InputText title={t("models.tenant.object")} defaultValue={data.tenantSubscription.tenant.name} readOnly />
      <InputText title={"Stripe ID"} defaultValue={data.stripeSubscriptionId ?? ""} readOnly />
      <InputText title={t("models.subscriptionProduct.object")} defaultValue={t(data.subscriptionProduct.title)} readOnly />
      <InputText title={t("models.subscription.quantity")} defaultValue={data.quantity?.toString() ?? ""} readOnly />
      {data.prices.length > 0 && (
        <InputGroup title={t("models.subscription.price")}>
          <div className="space-y-1">
            {data.prices.map((price) => (
              <Fragment key={price.id}>
                {price.subscriptionPrice ? (
                  <div className="grid grid-cols-3 gap-2">
                    <InputText defaultValue={price.subscriptionPrice.currency} readOnly />
                    <InputText defaultValue={price.subscriptionPrice.price?.toString() ?? ""} readOnly />
                    <InputText defaultValue={SubscriptionBillingPeriod[price.subscriptionPrice.billingPeriod]} readOnly />
                  </div>
                ) : (
                  <Fragment></Fragment>
                )}
              </Fragment>
            ))}
          </div>
        </InputGroup>
      )}
      <InputGroup title="Current period">
        <div className="space-y-1">
          <InputText title="Started at" defaultValue={data.currentPeriodStart ? DateUtils.dateYMD(data.currentPeriodStart) : "-"} readOnly />
          <InputText title="Ends at" defaultValue={data.currentPeriodEnd ? DateUtils.dateYMD(data.currentPeriodEnd) : "-"} readOnly />
        </div>
      </InputGroup>
      <InputText title="Created at" defaultValue={DateUtils.dateYMD(data.createdAt)} readOnly />
      <InputText title="Canceled at" defaultValue={data.cancelledAt ? DateUtils.dateYMD(data.cancelledAt) : "-"} readOnly />
      <InputText title="Ends at" defaultValue={data.endsAt ? DateUtils.dateYMD(data.endsAt) : "-"} readOnly />
    </div>
  );
}
