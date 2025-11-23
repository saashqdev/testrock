"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import ServerError from "@/components/ui/errors/ServerError";
import AddressBookIcon from "@/components/ui/icons/crm/AddressBookIcon";
import AddressBookIconFilled from "@/components/ui/icons/crm/AddressBookIconFilled";
import CompanyIcon from "@/components/ui/icons/crm/CompanyIcon";
import CompanyIconFilled from "@/components/ui/icons/crm/CompanyIconFilled";
import FormIcon from "@/components/ui/icons/crm/FormIcon";
import FormIconFilled from "@/components/ui/icons/crm/FormIconFilled";
import IncreaseIcon from "@/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "@/components/ui/icons/crm/IncreaseIconFilled";
import UsDollarCircled from "@/components/ui/icons/crm/UsDollarCircled";
import UsDollarCircledFilled from "@/components/ui/icons/crm/UsDollarCircledFilled";
import SidebarIconsLayout, { IconDto } from "@/components/ui/layouts/SidebarIconsLayout";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import RefreshIcon from "@/components/ui/icons/RefreshIcon";

export default ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const params = useParams();
  const items: IconDto[] = [
    {
      name: "Overview",
      href: params.tenant ? `/app/${params.tenant}/crm` : `/admin/crm`,
      exact: true,
      icon: <IncreaseIcon className="h-5 w-5" />,
      iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
    },
  ];

  // Always show these CRM entities in the sidenav
  const crmEntities = [
    { slug: "opportunities", defaultTitle: "Opportunities" },
    { slug: "companies", defaultTitle: "Companies" },
    { slug: "contacts", defaultTitle: "Contacts" },
    { slug: "submissions", defaultTitle: "Submissions" },
  ];

  crmEntities.forEach(({ slug, defaultTitle }) => {
    const entity = appOrAdminData?.entities.find((x) => x.slug === slug);
    items.push({
      name: entity ? t(entity.titlePlural) : defaultTitle,
      href: params.tenant ? `/app/${params.tenant}/crm/${slug}` : `/admin/crm/${slug}`,
      icon: getIcons(slug)?.icon,
      iconSelected: getIcons(slug)?.iconSelected,
    });
  });

  items.push({
    name: "Sync",
    href: params.tenant ? `/app/${params.tenant}/crm/sync` : `/admin/crm/sync`,
    icon: <RefreshIcon className="h-5 w-5" />,
    iconSelected: <RefreshIcon className="h-5 w-5" />,
  });

  function getIcons(entitySlug: string) {
    if (entitySlug === "opportunities") {
      return {
        icon: <UsDollarCircled className="h-5 w-5" />,
        iconSelected: <UsDollarCircledFilled className="h-5 w-5" />,
      };
    } else if (entitySlug === "companies") {
      return {
        icon: <CompanyIcon className="h-5 w-5" />,
        iconSelected: <CompanyIconFilled className="h-5 w-5" />,
      };
    } else if (entitySlug === "contacts") {
      return {
        icon: <AddressBookIcon className="h-5 w-5" />,
        iconSelected: <AddressBookIconFilled className="h-5 w-5" />,
      };
    } else if (entitySlug === "submissions") {
      return {
        icon: <FormIcon className="h-5 w-5" />,
        iconSelected: <FormIconFilled className="h-5 w-5" />,
      };
    }
  }
  return (
    <SidebarIconsLayout label={{ align: "right" }} items={items}>
      {children}
    </SidebarIconsLayout>
  );
};

export function ErrorBoundary() {
  return <ServerError />;
}
