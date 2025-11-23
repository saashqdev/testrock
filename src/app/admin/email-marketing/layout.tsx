"use client";

import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ReactNode } from "react";
import IncreaseIcon from "@/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "@/components/ui/icons/crm/IncreaseIconFilled";
import MegaphoneIcon from "@/components/ui/icons/emails/MegaphoneIcon";
import MegaphoneIconFilled from "@/components/ui/icons/emails/MegaphoneIconFilled";
import SentIcon from "@/components/ui/icons/emails/SentIcon";
import SentIconFilled from "@/components/ui/icons/emails/SentIconFilled";
import ActivityHistoryIcon from "@/components/ui/icons/entities/ActivityHistoryIcon";
import ActivityHistoryIconFilled from "@/components/ui/icons/entities/ActivityHistoryIconFilled";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";

export default function EmailMarketingLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const params = useParams();

  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Overview",
          href: params.tenant ? `/app/${params.tenant}/email-marketing` : "/admin/email-marketing",
          exact: true,
          icon: <IncreaseIcon className="h-5 w-5" />,
          iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
        },
        {
          name: "Campaigns",
          href: params.tenant ? `/app/${params.tenant}/email-marketing/campaigns` : "/admin/email-marketing/campaigns",
          icon: <MegaphoneIcon className="h-5 w-5" />,
          iconSelected: <MegaphoneIconFilled className="h-5 w-5" />,
        },
        {
          name: "Activity",
          href: params.tenant ? `/app/${params.tenant}/email-marketing/activity` : "/admin/email-marketing/activity",
          icon: <ActivityHistoryIcon className="h-5 w-5" />,
          iconSelected: <ActivityHistoryIconFilled className="h-5 w-5" />,
        },
        {
          name: t("emailMarketing.senders.plural"),
          href: params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders",
          icon: <SentIcon className="h-5 w-5" />,
          iconSelected: <SentIconFilled className="h-5 w-5" />,
        },
      ]}
    >
      {children}
    </SidebarIconsLayout>
  );
}
