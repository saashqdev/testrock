"use client";

import { useTranslation } from "react-i18next";
import Stripe from "stripe";
import { getFormattedPriceInCurrency } from "@/lib/helpers/PricingHelper";
import DateUtils from "@/lib/shared/DateUtils";

interface Props {
  items: Stripe.Invoice[];
}

export default function MyUpcomingInvoice({ items }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between space-x-2">
            <div className="text-sm font-medium">{t("app.subscription.invoices.upcoming")}</div>
          </div>
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col rounded-md border border-dashed border-border bg-secondary p-3">
              <div>
                <span className="font-medium">
                  {getFormattedPriceInCurrency({
                    currency: item.currency,
                    price: Number(item.amount_due / 100),
                  })}
                </span>{" "}
                <span className="text-sm uppercase text-muted-foreground">{item.currency}</span>
                <div className="text-sm text-muted-foreground">
                  {item.next_payment_attempt && DateUtils.dateMonthDayYear(new Date(item.next_payment_attempt * 1000))}
                </div>
              </div>
              {item.lines.data.map((lineItem, idx) => {
                return (
                  <div key={idx} className="text-sm">
                    {lineItem.price?.nickname && <span>{t(lineItem.price?.nickname)} &rarr; </span>}
                    {lineItem.description}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
