import { Metadata } from "next";
import MegaphoneFilled from "@/components/ui/icons/MegaphoneFilled";
import MegaphoneIcon from "@/components/ui/icons/emails/MegaphoneIcon";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";
import { getServerTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("affiliates.title")} | ${process.env.APP_NAME}`,
  };
}

export default function AffiliatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Affiliates",
          href: "/admin/affiliates",
          icon: <MegaphoneIcon className="h-5 w-5" />,
          iconSelected: <MegaphoneFilled className="h-5 w-5" />,
          exact: true,
        },
      ]}
    >
      {children}
    </SidebarIconsLayout>
  );
}
