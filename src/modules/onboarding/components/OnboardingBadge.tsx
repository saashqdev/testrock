"use client";

import { OnboardingModel } from "@/db/models/onboarding/OnboardingModel";
import { useTranslation } from "react-i18next";
import { Colors } from "@/lib/enums/shared/Colors";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";

export default function OnboardingBadge({ item }: { item: OnboardingModel }) {
  const { t } = useTranslation();
  return (
    <>
      {item.active && <SimpleBadge title={t("shared.active")} color={Colors.GREEN} />}
      {!item.active && <SimpleBadge title={t("shared.inactive")} color={Colors.GRAY} />}
    </>
  );
}
