import { Metadata } from "next";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";
import { getServerTranslations } from "@/i18n/server";
import ViewBoardsEmptyIcon from "@/components/ui/icons/ViewBoardsEmptyIcon";
import ViewBoardsIcon from "@/components/ui/icons/ViewBoardsIcon";
import BlockIcon from "@/components/ui/icons/pages/BlockIcon";
import BlockIconFilled from "@/components/ui/icons/pages/BlockIconFilled";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `Pages | ${process.env.APP_NAME}`,
  };
}

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Pages",
          href: "/admin/pages",
          icon: <ViewBoardsEmptyIcon className="h-5 w-5" />,
          iconSelected: <ViewBoardsIcon className="h-5 w-5" />,
          exact: true,
        },
        {
          name: "SEO",
          href: "/admin/pages/seo",
          icon: <BlockIcon className="h-5 w-5" />,
          iconSelected: <BlockIconFilled className="h-5 w-5" />,
        },
/*         {
          name: "A/B Testing",
          href: "/admin/pages/ab",
          icon: <ExperimentIcon className="h-5 w-5" />,
          iconSelected: <ExperimentIconFilled className="h-5 w-5" />,
        }, */
      ]}
    >
      {children}
    </SidebarIconsLayout>
  );
}
