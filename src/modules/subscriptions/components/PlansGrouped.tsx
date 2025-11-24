"use client";

import { Fragment, useState } from "react";
import { SubscriptionProductDto } from "@/modules/subscriptions/dtos/SubscriptionProductDto";
import Plans from "./Plans";
import Stripe from "stripe";
import { SubscriptionBillingPeriod } from "@/modules/subscriptions/enums/SubscriptionBillingPeriod";
import Modal from "@/components/ui/modals/Modal";
import { DefaultAppFeatures } from "@/modules/subscriptions/data/appFeatures";
import CreditsTableInfo from "@/modules/credits/components/CreditsTableInfo";
import { TenantSubscriptionWithDetailsDto } from "@/db/models";
import { IServerAction } from "@/lib/dtos/ServerComponentsProps";

interface Props {
  items: SubscriptionProductDto[];
  tenantSubscription?: TenantSubscriptionWithDetailsDto | null;
  canSubmit?: boolean;
  stripeCoupon: Stripe.Coupon | null;
  currenciesAndPeriod: {
    currencies: { value: string; options: string[] };
    billingPeriods: { value: SubscriptionBillingPeriod; options: SubscriptionBillingPeriod[] };
  };
  serverAction?: IServerAction | null;
}
export default function PlansGrouped({ items, tenantSubscription, canSubmit, stripeCoupon, currenciesAndPeriod, serverAction = null }: Props) {
  const [showFeatureInfoModal, setShowFeatureInfoModal] = useState<boolean>(false);
  const [showFeatureInfo, setShowFeatureInfo] = useState<string | null>(null);
  const groups = () => {
    const groups: { group: { title: string; description: string }; items: SubscriptionProductDto[] }[] = [];
    items.forEach((product) => {
      let found = groups.find((f) => f.group.title === product.groupTitle && f.group.description === product.groupDescription);
      if (!found) {
        found = groups.find((f) => !f.group.title && !f.group.description && !product.groupTitle && !product.groupDescription);
      }
      if (found) {
        found.items.push(product);
      } else {
        groups.push({
          group: {
            title: product.groupTitle ?? "",
            description: product.groupDescription ?? "",
          },
          items: [product],
        });
      }
    });
    return groups;
  };

  return (
    <Fragment>
      <div className="space-y-10">
        {groups().map((group, idx) => {
          return (
            <Fragment key={idx}>
              <div>
                {group.group.title && (
                  <div className="py-4">
                    <div className="py-2">
                      <h2 className="text-2xl font-bold md:text-3xl">{group.group.title}</h2>
                      <p className="text-lg text-muted-foreground">{group.group.description}</p>
                    </div>
                  </div>
                )}
                <Plans
                  key={idx}
                  items={group.items}
                  tenantSubscription={tenantSubscription}
                  canSubmit={canSubmit}
                  className="space-y-4"
                  stripeCoupon={stripeCoupon}
                  initialCurrency={currenciesAndPeriod.currencies.value}
                  availableCurrencies={currenciesAndPeriod.currencies.options}
                  initialBillingPeriod={currenciesAndPeriod.billingPeriods.value}
                  availableBillingPeriods={currenciesAndPeriod.billingPeriods.options}
                  serverAction={serverAction}
                  onClickFeature={(name) => {
                    setShowFeatureInfo(name);
                    setShowFeatureInfoModal(true);
                  }}
                />
              </div>
            </Fragment>
          );
        })}
      </div>

      <Modal size="lg" open={showFeatureInfoModal} setOpen={() => setShowFeatureInfoModal(false)}>
        {showFeatureInfo === DefaultAppFeatures.Credits && (
          <div>
            <CreditsTableInfo />
          </div>
        )}
      </Modal>
    </Fragment>
  );
}
