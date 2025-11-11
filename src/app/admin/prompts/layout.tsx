import { Metadata } from "next";
import { ReactNode } from "react";
import IncreaseIcon from "@/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "@/components/ui/icons/crm/IncreaseIconFilled";
import SettingsIcon from "@/components/ui/icons/crm/SettingsIcon";
import SettingsIconFilled from "@/components/ui/icons/crm/SettingsIconFilled";
import WorkflowIcon from "@/modules/workflowEngine/components/icons/WorkflowIcon";
import WorkflowIconFilled from "@/modules/workflowEngine/components/icons/WorkflowIconFilled";
import FolderIcon from "@/components/ui/icons/entities/FolderIcon";
import FolderIconFilled from "@/components/ui/icons/entities/FolderIconFilled";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  await verifyUserHasPermission("admin.prompts.view");
  
  return {
    title: `${t("prompts.builder.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function PromptsLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Overview",
          href: "/admin/prompts",
          icon: <IncreaseIcon className="h-5 w-5" />,
          iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
          exact: true,
        },
        {
          name: "Prompts",
          href: "/admin/prompts/builder",
          icon: <WorkflowIcon className="h-5 w-5" />,
          iconSelected: <WorkflowIconFilled className="h-5 w-5" />,
        },
        {
          name: "Groups",
          href: "/admin/prompts/groups",
          icon: <FolderIcon className="h-5 w-5" />,
          iconSelected: <FolderIconFilled className="h-5 w-5" />,
        },
        {
          name: "Settings",
          href: "/admin/feature-flags/settings",
          icon: <SettingsIcon className="h-5 w-5" />,
          iconSelected: <SettingsIconFilled className="h-5 w-5" />,
          bottom: true,
        },
      ]}
    >
      {children}
    </SidebarIconsLayout>
  );
}
