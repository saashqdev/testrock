"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ExternalLinkEmptyIcon from "@/components/ui/icons/ExternalLinkEmptyIcon";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import UrlUtils from "@/utils/app/UrlUtils";
import NumberUtils from "@/lib/shared/NumberUtils";
import { Colors } from "@/lib/enums/shared/Colors";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import GearIcon from "@/components/ui/icons/GearIcon";
import { useRootData } from "@/lib/state/useRootData";

type LoaderData = {
  item: PortalWithDetailsDto & { portalUrl?: string };
  overview: {
    users: number;
    visitors: number;
    products: number;
  };
};

type ActionData = { success?: string; error?: string };

interface PortalOverviewPageProps {
  data: LoaderData;
}

export default function PortalOverviewClient({ data: initialData }: PortalOverviewPageProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<LoaderData>(initialData);
  const [isPending, startTransition] = useTransition();
  const params = useParams();
  const rootData = useRootData();
  const portalsConfig = rootData.appConfiguration.portals;

  const handleTogglePublished = async () => {
    startTransition(async () => {
      try {
        const response = await fetch(window.location.pathname, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "toggle-published" }),
        });

        const result: ActionData = await response.json();

        if (result.success) {
          toast.success(result.success);
          // Update local state to reflect the change
          setData((prev) => ({
            ...prev,
            item: {
              ...prev.item,
              isPublished: !prev.item.isPublished,
            },
          }));
        } else if (result.error) {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("An error occurred");
      }
    });
  };

  return (
    <>
      <EditPageLayout
        title={
          <div className="flex items-baseline space-x-2">
            <div>{data.item.title} </div>
            <SimpleBadge
              title={data.item.isPublished ? t("shared.published") : t("shared.unpublished")}
              color={data.item.isPublished ? Colors.GREEN : Colors.GRAY}
            />
          </div>
        }
        withHome={false}
        menu={[
          {
            title: data.item.title,
            routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}`),
          },
          {
            title: t("shared.overview"),
          },
        ]}
        buttons={
          <>
            <div className="flex items-center space-x-2">
              <ButtonSecondary to="settings">
                <GearIcon className="h-4 w-4" />
              </ButtonSecondary>
              <ButtonSecondary onClick={handleTogglePublished} disabled={isPending}>
                {data.item.isPublished ? t("shared.unpublish") : t("shared.publish")}
              </ButtonSecondary>
            </div>
            {data.item.portalUrl && (
              <ButtonPrimary to={data.item.portalUrl} target="_blank" disabled={!data.item.isPublished}>
                <div className="flex items-center space-x-2">
                  <ExternalLinkEmptyIcon className="h-4 w-4" />
                </div>
              </ButtonPrimary>
            )}
          </>
        }
      >
        <dl className="grid gap-2 sm:grid-cols-3">
          <Link href="users" className="group">
            <div className="group rounded-lg border border-border bg-background p-4">
              <dt className="truncate text-xs font-medium uppercase text-muted-foreground group-hover:underline">{t("models.user.plural")}</dt>
              <dd className="mt-1 truncate text-2xl font-semibold text-foreground">{NumberUtils.intFormat(data.overview.users)}</dd>
            </div>
          </Link>
          {portalsConfig?.analytics && (
            <Link href="analytics" className="group">
              <div className="group rounded-lg border border-border bg-background p-4">
                <dt className="truncate text-xs font-medium uppercase text-muted-foreground group-hover:underline">Visitors</dt>
                <dd className="mt-1 truncate text-2xl font-semibold text-foreground">{NumberUtils.intFormat(data.overview.visitors)}</dd>
              </div>
            </Link>
          )}

          {portalsConfig?.pricing && (
            <Link href="pricing" className="group">
              <div className="group rounded-lg border border-border bg-background p-4">
                <dt className="truncate text-xs font-medium uppercase text-muted-foreground group-hover:underline">Products</dt>
                <dd className="mt-1 truncate text-2xl font-semibold text-foreground">{NumberUtils.intFormat(data.overview.products)}</dd>
              </div>
            </Link>
          )}
        </dl>
      </EditPageLayout>
    </>
  );
}
