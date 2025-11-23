import IconWidgets from "@/components/layouts/icons/IconWidgets";
import ServerError from "@/components/ui/errors/ServerError";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";
import UrlUtils from "@/utils/app/UrlUtils";
import { db } from "@/db";

interface WidgetsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

export default async function WidgetsLayout({ children, params }: WidgetsLayoutProps) {
  const { tenant } = await params;
  const appConfiguration = await db.appConfiguration.getAppConfiguration();

  if (tenant && !appConfiguration.widgets.enabled) {
    throw new Error("Widgets are disabled");
  }

  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "widgets.plural",
          href: UrlUtils.getModulePath({ tenant }, `widgets`),
          exact: true,
          icon: <IconWidgets className="h-5 w-5" />,
          iconSelected: <IconWidgets className="h-5 w-5" />,
        },
      ]}
    >
      {children}
    </SidebarIconsLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
