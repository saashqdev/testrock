import { Metadata } from "next";
import TagsIcon from "@/components/ui/icons/crud/TagsIcon";
import TagsIconFilled from "@/components/ui/icons/crud/TagsIconFilled";
import BlockIcon from "@/components/ui/icons/pages/BlockIcon";
import BlockIconFilled from "@/components/ui/icons/pages/BlockIconFilled";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("pages.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function AdminPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyUserHasPermission("admin.pages.view");
  const { t } = await getServerTranslations();
  
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: t("pages.title"),
          href: `/admin/pages`,
          exact: true,
          icon: <BlockIcon className="h-5 w-5" />,
          iconSelected: <BlockIconFilled className="h-5 w-5" />,
        },
        {
          name: "SEO",
          href: `/admin/pages/seo`,
          exact: true,
          icon: <TagsIcon className="h-5 w-5" />,
          iconSelected: <TagsIconFilled className="h-5 w-5" />,
        },
        // {
        //   name: "AB Testing",
        //   href: `/admin/pages/ab`,
        //   exact: true,
        //   icon: "🚧",
        //   iconSelected: "🚧",
        // },
      ]}
    >
      {children}
    </SidebarIconsLayout>
  );
}
