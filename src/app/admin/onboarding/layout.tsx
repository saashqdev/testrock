import { Metadata } from "next";
import IncreaseIcon from "@/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "@/components/ui/icons/crm/IncreaseIconFilled";
import GoalIcon from "@/components/ui/icons/onboardings/GoalIcon";
import GoalIconFilled from "@/components/ui/icons/onboardings/GoalIconFilled";
import JourneyIcon from "@/components/ui/icons/onboardings/JourneyIcon";
import JourneyIconFilled from "@/components/ui/icons/onboardings/JourneyIconFilled";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("onboarding.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyUserHasPermission("admin.onboarding.view");
  
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Overview",
          href: "/admin/onboarding/onboardings",
          exact: true,
          icon: <IncreaseIcon className="h-5 w-5" />,
          iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
        },
        {
          name: "Onboardings",
          href: "/admin/onboarding/onboardings",
          icon: <GoalIcon className="h-5 w-5" />,
          iconSelected: <GoalIconFilled className="h-5 w-5" />,
        },
        {
          name: "Sessions",
          href: "/admin/onboarding/sessions",
          icon: <JourneyIcon className="h-5 w-5" />,
          iconSelected: <JourneyIconFilled className="h-5 w-5" />,
        },
      ]}
    >
      {children}
    </SidebarIconsLayout>
  );
}
