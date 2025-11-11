"use client";

import { useTranslation } from "react-i18next";
import { HoverEffect } from "@/components/aceternity/HoverEffect";
import DateUtils from "@/lib/shared/DateUtils";
import { SurveyWithDetailsDto } from "@/db/models/helpDesk/SurveysModel";

interface SurveysClientProps {
  items: SurveyWithDetailsDto[];
}

export default function SurveysClient({ items }: SurveysClientProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <h3 className="px-2 text-xl font-semibold">{t("surveys.title")}</h3>
      <HoverEffect
        items={items.map((item) => ({
          className: item.isEnabled ? "bg-green-200/50 dark:bg-green-500/90 dark:text-white" : undefined,
          disabled: !item.isEnabled,
          name: item.title,
          description: item.description || "",
          link: {
            href: `/surveys/${item.slug}`,
          },
          highlight: {
            text: DateUtils.dateAgo(item.createdAt),
          },
          subFeatures: [{ name: item._count.submissions + " " + t("surveys.submission.plural").toLowerCase() }],
        }))}
      />
    </div>
  );
}
