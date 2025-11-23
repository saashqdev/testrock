import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import ServerError from "@/components/ui/errors/ServerError";
import IncreaseIcon from "@/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "@/components/ui/icons/crm/IncreaseIconFilled";
import MegaphoneIcon from "@/components/ui/icons/emails/MegaphoneIcon";
import MegaphoneIconFilled from "@/components/ui/icons/emails/MegaphoneIconFilled";
import SentIcon from "@/components/ui/icons/emails/SentIcon";
import SentIconFilled from "@/components/ui/icons/emails/SentIconFilled";
import ActivityHistoryIcon from "@/components/ui/icons/entities/ActivityHistoryIcon";
import ActivityHistoryIconFilled from "@/components/ui/icons/entities/ActivityHistoryIconFilled";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";
import CrmService from "@/modules/crm/services/CrmService";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { db } from "@/db";

type Props = {
  params: Promise<{ tenant: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("emailMarketing.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function EmailMarketingLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const { t } = await getServerTranslations();

  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.app.features.tenantEmailMarketing) {
    redirect(`/app/${resolvedParams.tenant}`);
  }

  // Create a mock request for validation
  const url = new URL(`${process.env.NEXTAUTH_URL}/app/${resolvedParams.tenant}/email-marketing`);
  const request = new Request(url.toString());
  const tenantId = await getTenantIdOrNull({ request, params: resolvedParams });
  await CrmService.validate(tenantId);

  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Overview",
          href: `/app/${resolvedParams.tenant}/email-marketing`,
          exact: true,
          icon: <IncreaseIcon className="h-5 w-5" />,
          iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
        },
        {
          name: "Campaigns",
          href: `/app/${resolvedParams.tenant}/email-marketing/campaigns`,
          icon: <MegaphoneIcon className="h-5 w-5" />,
          iconSelected: <MegaphoneIconFilled className="h-5 w-5" />,
        },
        {
          name: "Activity",
          href: `/app/${resolvedParams.tenant}/email-marketing/activity`,
          icon: <ActivityHistoryIcon className="h-5 w-5" />,
          iconSelected: <ActivityHistoryIconFilled className="h-5 w-5" />,
        },
        {
          name: t("emailMarketing.senders.plural"),
          href: `/app/${resolvedParams.tenant}/email-marketing/senders`,
          icon: <SentIcon className="h-5 w-5" />,
          iconSelected: <SentIconFilled className="h-5 w-5" />,
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
