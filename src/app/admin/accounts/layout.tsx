import { getServerTranslations } from "@/i18n/server";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";
import CustomerIcon from "@/components/ui/icons/settings/CustomerIcon";
import CompanyIcon from "@/components/ui/icons/crm/CompanyIcon";
import { LinkIcon, LockIcon } from "lucide-react";
import { NoSymbolIcon, ServerStackIcon } from "@heroicons/react/24/outline";
import { db } from "@/db";

export default async function AccountsLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getServerTranslations();
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: t("admin.tenants.title"),
          href: "/admin/accounts",
          exact: true,
          icon: <CompanyIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
          iconSelected: <CompanyIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        },
        {
          name: t("models.user.plural"),
          href: "/admin/accounts/users",
          icon: <CustomerIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
          iconSelected: <CustomerIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        },
        {
          name: t("app.sidebar.rolesAndPermissions"),
          href: "/admin/accounts/roles-and-permissions/roles",
          icon: <LockIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
          iconSelected: <LockIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        },
        {
          name: "Relationships",
          href: "/admin/accounts/relationships",
          hidden: !appConfiguration.app.features.tenantTypes,
          icon: <LinkIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
          iconSelected: <LinkIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        },
        {
          name: "Subscriptions",
          href: "/admin/accounts/subscriptions",
          hidden: true,
        },
        {
          name: t("models.blacklist.object"),
          href: "/admin/accounts/blacklist",
          icon: <NoSymbolIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
          iconSelected: <NoSymbolIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        },
        {
          name: t("models.tenantIpAddress.plural"),
          href: "/admin/accounts/ip-addresses",
          icon: <ServerStackIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
          iconSelected: <ServerStackIcon className="text-muted-foreground h-5 w-5 shrink-0" aria-hidden="true" />,
        },
      ]}
    >
      {children}
    </SidebarIconsLayout>
  );
}
