"use client";

import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { SubscriptionFeatureDto } from "@/lib/dtos/subscriptions/SubscriptionFeatureDto";
import { SubscriptionFeatureLimitType } from "@/lib/enums/subscriptions/SubscriptionFeatureLimitType";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import XIcon from "@/components/ui/icons/XIcon";

interface Props {
  item: SubscriptionFeatureDto | undefined;
}
export default function PlanFeatureValue({ item }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      {item ? (
        <div className="flex items-baseline space-x-1">
          {item.type === SubscriptionFeatureLimitType.INCLUDED && <CheckIcon className={clsx("h-4 w-4 text-center text-primary")} />}
          {item.type === SubscriptionFeatureLimitType.NOT_INCLUDED && <XIcon className={clsx("h-4 w-4 text-center text-gray-300")} />}
          {item.type === SubscriptionFeatureLimitType.MONTHLY && <span className="lowercase text-muted-foreground">{item.value}/month</span>}
          {item.type === SubscriptionFeatureLimitType.MAX && <span className="lowercase text-muted-foreground">{item.value}</span>}
          {item.type === SubscriptionFeatureLimitType.UNLIMITED && <span className="lowercase text-muted-foreground">{t("shared.unlimited")}</span>}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      )}
    </div>
  );
}
