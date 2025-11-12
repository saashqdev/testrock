"use client";

import { useAppData } from "@/lib/state/useAppData";
import { AppSettingsLayoutLoaderData } from "./layout";
import { useTranslation } from "react-i18next";
import CompanyIcon from "@/components/ui/icons/crm/CompanyIcon";
import CompanyIconFilled from "@/components/ui/icons/crm/CompanyIconFilled";
import CreditsIcon from "@/components/ui/icons/CreditsIcon";
import CreditsIconFilled from "@/components/ui/icons/CreditsIconFilled";
import CustomerIcon from "@/components/ui/icons/settings/CustomerIcon";
import CustomerIconFilled from "@/components/ui/icons/settings/CustomerIconFilled";
import ExperimentIcon from "@/components/ui/icons/tests/ExperimentIcon";
import ExperimentIconFilled from "@/components/ui/icons/tests/ExperimentIconFilled";
import MembershipCardIcon from "@/components/ui/icons/settings/MembershipCardIcon";
import MembershipCardIconFilled from "@/components/ui/icons/settings/MembershipCardIconFilled";
import PeopleIcon from "@/components/ui/icons/settings/PeopleIcon";
import PeopleIconFilled from "@/components/ui/icons/settings/PeopleIconFilled";
import RestApiIcon from "@/components/ui/icons/entities/RestApiIcon";
import RestApiIconFilled from "@/components/ui/icons/entities/RestApiIconFilled";
import ActivityHistoryIcon from "@/components/ui/icons/entities/ActivityHistoryIcon";
import ActivityHistoryIconFilled from "@/components/ui/icons/entities/ActivityHistoryIconFilled";
import ModulesIcon from "@/components/ui/icons/entities/ModulesIcon";
import ModulesIconFilled from "@/components/ui/icons/entities/ModulesIconFilled";
import SidebarIconsLayout, { IconDto } from "@/components/ui/layouts/SidebarIconsLayout";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import UrlUtils from "@/lib/utils/UrlUtils";
import { CreditTypes } from "@/modules/usage/dtos/CreditType";
import { useParams } from "next/navigation";
import React from "react";
import { useRootData } from "@/lib/state/useRootData";

export default function ({ data, children }: { data: AppSettingsLayoutLoaderData; children: React.ReactNode }) {
  const { t } = useTranslation();
  const appData = useAppData();
  const rootData = useRootData();
  const params = useParams();

  const getTabs = () => {
    const tabs: IconDto[] = [];
    tabs.push({
      name: t("settings.profile.profileTitle"),
      href: UrlUtils.currentTenantUrl(params, "settings/profile"),
      icon: <CustomerIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
      iconSelected: <CustomerIconFilled className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
    });
    if (getUserHasPermission(appData, "app.settings.members.view")) {
      tabs.push({
        name: t("settings.members.title"),
        href: UrlUtils.currentTenantUrl(params, "settings/members"),
        icon: <PeopleIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        iconSelected: <PeopleIconFilled className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
      });
    }
    if (getUserHasPermission(appData, "app.settings.subscription.view")) {
      tabs.push({
        name: t("settings.subscription.title"),
        href: UrlUtils.currentTenantUrl(params, `settings/subscription`),
        icon: <MembershipCardIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        iconSelected: <MembershipCardIconFilled className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
      });
      if (CreditTypes.length > 0) {
        tabs.push({
          name: t("models.credit.plural"),
          href: UrlUtils.currentTenantUrl(params, "settings/credits"),
          icon: <CreditsIcon className="h-5 w-5" />,
          iconSelected: <CreditsIconFilled className="h-5 w-5" />,
        });
      }
    }
    if (getUserHasPermission(appData, "app.settings.account.view")) {
      tabs.push({
        name: t("settings.tenant.title"),
        href: UrlUtils.currentTenantUrl(params, "settings/account"),
        exact: true,
        icon: <CompanyIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        iconSelected: <CompanyIconFilled className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
      });
    }
    // if (rootData.appConfiguration.app.features.tenantTypes && getUserHasPermission(appData, "app.settings.accounts.view")) {
    //   tabs.push({
    //     name: t("models.tenant.plural"),
    //     href: UrlUtils.currentTenantUrl(params, "settings/accounts"),
    //     icon: <LinkIcon className=" text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
    //     iconSelected: <LinkIconFilled className=" text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
    //   });
    // }
    // if (getUserHasPermission(appData, "app.settings.roles.view")) {
    //   tabs.push({
    //     name: t("models.role.plural"),
    //     href: UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions"),
    //     icon: <AccessDeniedIcon className=" h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />,
    //     iconSelected: <AccessDeniedIconFilled className=" h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />,
    //   });
    // }
    // tabs.push({
    //   name: t("models.group.plural"),
    //   href: UrlUtils.currentTenantUrl(params, "settings/groups"),
    //   icon: <GroupIcon className=" h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />,
    //   iconSelected: <GroupIconFilled className=" h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />,
    // });
    if (rootData.appConfiguration.app.features.tenantApiKeys && getUserHasPermission(appData, "app.settings.apiKeys.view")) {
      tabs.push({
        name: "API",
        href: UrlUtils.currentTenantUrl(params, "settings/api"),
        icon: <RestApiIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        iconSelected: <RestApiIconFilled className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
      });
    }
    if (getUserHasPermission(appData, "app.settings.auditTrails.view")) {
      tabs.push({
        name: t("models.log.plural"),
        href: UrlUtils.currentTenantUrl(params, "settings/logs"),
        icon: <ActivityHistoryIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        iconSelected: <ActivityHistoryIconFilled className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
      });
    }
    if (rootData.appConfiguration.app.features.tenantEntityCustomization) {
      tabs.push({
        name: t("models.entity.plural"),
        href: UrlUtils.currentTenantUrl(params, "settings/entities"),
        icon: <ModulesIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        iconSelected: <ModulesIconFilled className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
      });
    }
    if (!data.isProduction && appData?.isSuperAdmin) {
      tabs.push({
        name: "Debug",
        href: UrlUtils.currentTenantUrl(params, "settings/debug"),
        icon: <ExperimentIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        iconSelected: <ExperimentIconFilled className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
      });
    }
    return tabs;
  };

  return (
    <SidebarIconsLayout label={{ align: "right" }} items={getTabs()}>
      {children}
    </SidebarIconsLayout>
  );
}
