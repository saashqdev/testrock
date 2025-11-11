"use client";

import { useParams } from "next/navigation";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";
import { useTranslation } from "react-i18next";
import UrlUtils from "@/utils/app/UrlUtils";
import IconAnalytics from "@/components/layouts/icons/IconAnalytics";
import WebsiteIcon from "@/components/ui/icons/WebsiteIcon";
import WebsiteIconFilled from "@/components/ui/icons/WebsiteIconFilled";
import IconPages from "@/components/layouts/icons/IconPages";
import ExclamationTriangleIcon from "@/components/ui/icons/ExclamationTriangleIcon";
import UserGroupIconFilled from "@/components/ui/icons/UserGroupIconFilled";
import UserGroupIcon from "@/components/ui/icons/UserGroupIcon";
import SettingsIcon from "@/components/ui/icons/crm/SettingsIcon";
import SettingsIconFilled from "@/components/ui/icons/crm/SettingsIconFilled";
import CurrencyIcon from "@/components/ui/icons/CurrencyIcon";
import { useRootData } from "@/lib/state/useRootData";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const params = useParams();
  const rootData = useRootData();
  const portalsConfig = rootData.appConfiguration.portals;

  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: t("models.portal.overview"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}`),
          icon: <WebsiteIcon className="h-5 w-5" />,
          iconSelected: <WebsiteIconFilled className="h-5 w-5" />,
          exact: true,
        },
        {
          name: t("models.portal.users"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}/users`),
          icon: <UserGroupIcon className="h-5 w-5" />,
          iconSelected: <UserGroupIconFilled className="h-5 w-5" />,
        },
        {
          name: t("models.portal.pages"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}/pages`),
          icon: <IconPages className="h-5 w-5" />,
          iconSelected: <IconPages className="h-5 w-5" />,
        },
        ...(portalsConfig?.pricing
          ? [
              {
                name: t("models.portal.pricing"),
                href: UrlUtils.getModulePath(params, `portals/${params.portal}/pricing`),
                icon: <CurrencyIcon className="h-5 w-5" />,
                iconSelected: <CurrencyIcon className="h-5 w-5" />,
              },
            ]
          : []),
        ...(portalsConfig?.analytics
          ? [
              {
                name: t("models.portal.analytics.title"),
                href: UrlUtils.getModulePath(params, `portals/${params.portal}/analytics`),
                icon: <IconAnalytics className="h-5 w-5" />,
                iconSelected: <IconAnalytics className="h-5 w-5" />,
              },
            ]
          : []),
        ...(portalsConfig?.domains?.enabled
          ? [
              {
                name: t("models.portal.domains"),
                href: UrlUtils.getModulePath(params, `portals/${params.portal}/domains`),
                icon: <WebsiteIcon className="h-5 w-5" />,
                iconSelected: <WebsiteIconFilled className="h-5 w-5" />,
              },
            ]
          : []),
        {
          name: t("shared.settings"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}/settings`),
          icon: <SettingsIcon className="h-5 w-5" />,
          iconSelected: <SettingsIconFilled className="h-5 w-5" />,
        },
        {
          name: t("models.portal.danger"),
          href: UrlUtils.getModulePath(params, `portals/${params.portal}/danger`),
          icon: <ExclamationTriangleIcon className="h-5 w-5" />,
          iconSelected: <ExclamationTriangleIcon className="h-5 w-5" />,
        },
      ]}
    >
      {children}
    </SidebarIconsLayout>
  );
}
