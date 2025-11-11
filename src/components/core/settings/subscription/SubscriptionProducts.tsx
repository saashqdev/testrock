"use client";

import { useTranslation } from "react-i18next";
import { TenantSubscriptionWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionsModel";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";

interface Props {
  products: SubscriptionProductDto[];
  subscription: TenantSubscriptionWithDetailsDto | null;
  canCancel: boolean;
  onCancel: () => void;
}

export default function SubscriptionProducts({ products, subscription, canCancel, onCancel }: Props) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();

  return (
    <div>
      {products.length === 0 ? (
        <>
          {appOrAdminData?.user.admin ? (
            <WarningBanner redirect="/admin/settings/pricing" title={t("shared.warning")} text={t("admin.pricing.noPricesInDatabase")} />
          ) : (
            <WarningBanner title={t("shared.warning")} text={t("admin.pricing.noPricesConfigured")} />
          )}
        </>
      ) : (
        <>
          {products.map((product, idx) => {
            return <div key={idx}>{t(product.title)}</div>;
          })}
        </>
      )}
    </div>
  );
}
