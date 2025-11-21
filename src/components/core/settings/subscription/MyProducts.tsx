"use client";

import { useTranslation } from "react-i18next";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import Link from "next/link";
import TenantProduct from "./TenantProduct";
import { TenantSubscriptionProductWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionProductsModel";
import { useParams } from "next/navigation";
import UrlUtils from "@/lib/utils/UrlUtils";

interface Props {
  currentTenant: { slug: string };
  items: TenantSubscriptionProductWithDetailsDto[];
  onCancel?: (item: TenantSubscriptionProductWithDetailsDto) => void;
}

export default function MyProducts({ currentTenant, items, onCancel }: Props) {
  const { t } = useTranslation();
  const params = useParams();

  return (
    <div>
      {items.length === 0 ? (
        <>
          <WarningBanner title={t("settings.subscription.noSubscription")} text={""}>
            <Link href={UrlUtils.currentTenantUrl(params, "pricing")} className="underline">
              {t("settings.subscription.viewAllProducts")}.
            </Link>
          </WarningBanner>
        </>
      ) : (
        <>
          <div className="grid gap-2">
            {items.map((item, idx) => {
              return <TenantProduct key={idx} item={item} onCancel={onCancel} />;
            })}
          </div>

          {/* <div className="flex justify-end mt-2 text-sm">
            <Link href={UrlUtils.currentTenantUrl(params, "pricing")} className="underline">
              {t("settings.subscription.viewAllProducts")}
            </Link>
          </div> */}
        </>
      )}
    </div>
  );
}
