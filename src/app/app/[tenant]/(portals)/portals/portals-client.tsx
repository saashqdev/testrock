"use client";

import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import Link from "next/link";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import UrlUtils from "@/utils/app/UrlUtils";
import { useRootData } from "@/lib/state/useRootData";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import EmptyState from "@/components/ui/emptyState/EmptyState";
import ExternalLinkEmptyIcon from "@/components/ui/icons/ExternalLinkEmptyIcon";
import EyeIcon from "@/components/ui/icons/EyeIcon";
import { PortalWithCountDto } from "@/db/models/portals/PortalsModel";
import Image from "next/image";

type PortalWithCounts = PortalWithCountDto & {
  portalUrl?: string;
  _count: {
    users: number;
    subscriptionProducts: number;
    visitors?: number;
  };
};

type LoaderData = {
  items: PortalWithCounts[];
};

export default function PortalsClient({ data }: { data: LoaderData }) {
  const { t } = useTranslation();
  const rootData = useRootData();
  const params = useParams();
  const portalsConfig = rootData.appConfiguration.portals;

  return (
    <EditPageLayout
      title={t("models.portal.plural")}
      buttons={
        <>
          <ButtonPrimary to={UrlUtils.getModulePath(params, `portals/new`)}>{t("shared.new")}</ButtonPrimary>
        </>
      }
    >
      {!rootData.appConfiguration.portals?.enabled && (
        <WarningBanner title={t("shared.warning")}>
          Portals are not enabled. Enabled it at <code className="font-bold">db/repositories/prisma/AppConfigurationDbPrisma.ts</code>.
        </WarningBanner>
      )}

      {data.items.length === 0 ? (
        <EmptyState
          className="bg-white"
          captions={{
            thereAreNo: t("shared.noRecords"),
          }}
        />
      ) : (
        <div className="space-y-2">
          {data.items.map((item) => {
            return (
              <div key={item.id} className="group relative w-full space-y-2 rounded-md border-2 border-gray-300 bg-white p-6 shadow-sm hover:border-gray-400">
                <div className="flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3">
                    {item.brandingLogo && (
                      <div>
                        <Image className="h-12 w-12 rounded-md" src={item.brandingLogo} alt={item.title} width={48} height={48} />
                      </div>
                    )}
                    <div className="flex flex-col truncate">
                      <Link href={UrlUtils.getModulePath(params, `portals/${item.subdomain}`)} className="truncate text-sm font-bold text-gray-800 hover:underline">
                        {item.title}
                      </Link>
                      {item.portalUrl && (
                        <a href={item.portalUrl} target="_blank" rel="noreferrer" className="flex items-center space-x-1 truncate text-xs text-gray-500 hover:underline">
                          <ExternalLinkEmptyIcon className="h-3 w-3" />
                          <div className="truncate">{item.portalUrl}</div>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.isPublished ? (
                      <div className="flex items-center space-x-1 text-xs text-teal-600">
                        <EyeIcon className="h-4 w-4" />
                        <div>{t("models.portal.published")}</div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <EyeIcon className="h-4 w-4" />
                        <div>{t("models.portal.draft")}</div>
                      </div>
                    )}
                  </div>
                </div>

                <dl className="grid grid-cols-1 gap-1 sm:grid-cols-3">
                  <div className="truncate text-xs sm:col-span-1">
                    <dt className="truncate font-medium text-gray-500">{t("models.portal.object")}</dt>
                    <dd className="mt-1 truncate text-gray-900">{item.subdomain}</dd>
                  </div>
                  <div className="truncate text-xs sm:col-span-1">
                    <dt className="truncate font-medium text-gray-500">{t("models.user.plural")}</dt>
                    <dd className="mt-1 truncate text-gray-900">{item._count.users}</dd>
                  </div>
                  <div className="truncate text-xs sm:col-span-1">
                    <dt className="truncate font-medium text-gray-500">{t("models.visitor.plural")}</dt>
                    <dd className="mt-1 truncate text-gray-900">{item._count.visitors ?? 0}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      )}
    </EditPageLayout>
  );
}
