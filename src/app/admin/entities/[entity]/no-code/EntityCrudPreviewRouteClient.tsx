"use client";

import { Entity } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { ReactNode } from "react";

export function EntityCrudPreviewRouteClient({ item, entitySlug, children }: { item: Entity; entitySlug: string; children?: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground">{t(item.title)} - Sample views</h1>
      </div>
      {children}
    </div>
  );
}
