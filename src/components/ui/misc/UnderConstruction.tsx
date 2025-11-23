"use client";

import { useTranslation } from "react-i18next";
import NextRockProFeature from "./NextRockProFeature";

export default function UnderConstruction({ title, description, proFeature }: { title?: string; description?: string; proFeature?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3">
      {title && (
        <div className="text-lg font-extrabold text-foreground">
          <span>{title}</span>
        </div>
      )}
      {description && <div className="text-sm text-muted-foreground">{description}</div>}
      {proFeature && <NextRockProFeature />}
      <div className="flex flex-col justify-center space-y-4 rounded-md border-2 border-dashed border-yellow-300 bg-yellow-50 py-6 text-center font-medium dark:bg-yellow-100 dark:text-yellow-800">
        <div>{t("shared.underConstruction")} 🚧</div>
      </div>
    </div>
  );
}
