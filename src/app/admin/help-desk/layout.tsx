import { Metadata } from "next";
import FeedbackIcon from "@/components/ui/icons/FeedbackIcon";
import FeedbackIconFilled from "@/components/ui/icons/FeedbackIconFilled";
import IncreaseIcon from "@/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "@/components/ui/icons/crm/IncreaseIconFilled";
import SettingsIcon from "@/components/ui/icons/crm/SettingsIcon";
import SettingsIconFilled from "@/components/ui/icons/crm/SettingsIconFilled";
import InboxIcon from "@/components/ui/icons/emails/InboxIcon";
import InboxIconFilled from "@/components/ui/icons/emails/InboxIconFilled";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";

export const metadata: Metadata = {
  title: `Help Desk | ${process.env.APP_NAME}`,
};

export default function HelpDeskLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Overview",
          href: "/admin/help-desk",
          icon: <IncreaseIcon className="h-5 w-5" />,
          iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
          exact: true,
        },
        {
          name: "Feedback",
          href: "/admin/help-desk/feedback",
          icon: <FeedbackIcon className="h-5 w-5" />,
          iconSelected: <FeedbackIconFilled className="h-5 w-5" />,
        },
        {
          name: "Surveys",
          href: "/admin/help-desk/surveys",
          icon: <FeedbackIcon className="h-5 w-5" />,
          iconSelected: <FeedbackIconFilled className="h-5 w-5" />,
        },
        {
          name: "Inbound emails",
          href: "/admin/help-desk/inbound-emails",
          icon: <InboxIcon className="h-5 w-5" />,
          iconSelected: <InboxIconFilled className="h-5 w-5" />,
        },
        {
          name: "Settings",
          href: "/admin/help-desk/settings",
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
