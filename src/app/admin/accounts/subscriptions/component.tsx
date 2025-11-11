"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import TenantBadge from "@/components/core/tenants/TenantBadge";
import DateCell from "@/components/ui/dates/DateCell";
import InputFilters from "@/components/ui/input/InputFilters";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import SubscriptionUtils from "@/utils/app/SubscriptionUtils";
import { TenantSubscriptionProductWithTenantDto } from "@/db/models/subscriptions/TenantSubscriptionProductsModel";
import DateUtils from "@/lib/shared/DateUtils";
import NumberUtils from "@/lib/shared/NumberUtils";

interface ComponentProps {
  items: TenantSubscriptionProductWithTenantDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
  isStripeTest: boolean;
}

export default function Component({ items, pagination, filterableProperties, isStripeTest }: ComponentProps) {
  const { t } = useTranslation();

  return (
    <EditPageLayout
      title={t("models.subscription.plural")}
      buttons={
        <>
          <InputFilters filters={filterableProperties} withSearch={false} />
        </>
      }
    >
      <TableSimple
        items={items}
        pagination={pagination}
        headers={[
          {
            name: "tenant",
            title: t("models.tenant.object"),
            value: (i) => <TenantBadge item={i.tenantSubscription.tenant} />,
          },
          {
            name: "subscriptionProduct",
            title: t("models.subscriptionProduct.object"),
            value: (i) => "",
            className: "w-full",
            formattedValue: (product) => (
              <span>
                <div key={product.id}>
                  <div>
                    {t(product.subscriptionProduct.title)}{" "}
                    {product.prices
                      .map(
                        (f) =>
                          `$${NumberUtils.decimalFormat(Number(f.subscriptionPrice?.price ?? 0))} - ${SubscriptionUtils.getBillingPeriodDescription(
                            t,
                            f.subscriptionPrice?.billingPeriod ?? 0
                          )}`
                      )
                      .join(", ")}
                  </div>
                </div>
              </span>
            ),
          },
          {
            name: "period",
            title: t("models.subscription.period"),
            value: (i) => (
              <div>
                {i.currentPeriodStart && i.currentPeriodEnd ? (
                  <div className="flex items-center space-x-1">
                    <DateCell date={i.currentPeriodStart} displays={["mdy"]} />
                    <div>-</div>
                    <DateCell date={i.currentPeriodEnd} displays={["mdy"]} />
                  </div>
                ) : (
                  <div>-</div>
                )}
              </div>
            ),
          },
          {
            name: "cancelledAt",
            title: t("models.subscription.cancelledAt"),
            value: (i) => <div>{i.cancelledAt ? <DateCell date={i.cancelledAt} displays={["mdy"]} /> : "-"}</div>,
          },
          {
            name: "endsAt",
            title: t("models.subscription.endsAt"),
            value: (i) => (
              <div>
                {i.endsAt ? (
                  <div>
                    {new Date() < new Date(i.endsAt) ? (
                      <div className="text-orange-500">
                        {t("settings.subscription.ends")} {DateUtils.dateMonthDayYear(i.endsAt)}
                      </div>
                    ) : (
                      <div className="text-red-500">
                        {t("settings.subscription.endedAt")} {DateUtils.dateMonthDayYear(i.endsAt)}
                      </div>
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </div>
            ),
          },
          {
            name: "actions",
            title: "",
            value: (i) => (
              <Link href={`/admin/accounts/subscriptions/${i.id}`} className="hover:underline">
                {t("shared.edit")}
              </Link>
            ),
          },
        ]}
      />
    </EditPageLayout>
  );
}
