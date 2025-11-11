"use client";

import { useParams } from "next/navigation";
import IncreaseIcon from "@/components/ui/icons/crm/IncreaseIcon";
import IncreaseIconFilled from "@/components/ui/icons/crm/IncreaseIconFilled";
import AlarmIcon from "@/components/ui/icons/notifications/AlarmIcon";
import AlarmIconFilled from "@/components/ui/icons/notifications/AlarmIconFilled";
import ChannelIcon from "@/components/ui/icons/notifications/ChannelIcon";
import ChannelIconFilled from "@/components/ui/icons/notifications/ChannelIconFilled";
import EarIcon from "@/components/ui/icons/notifications/EarIcon";
import EarIconFilled from "@/components/ui/icons/notifications/EarIconFilled";
import SidebarIconsLayout from "@/components/ui/layouts/SidebarIconsLayout";
import { ReactNode } from "react";

export default function NotificationsLayoutClient({ children }: { children: ReactNode }) {
  const params = useParams();
  return (
    <SidebarIconsLayout
      label={{ align: "right" }}
      items={[
        {
          name: "Overview",
          href: params.tenant ? `/app/${params.tenant}/notifications` : "/admin/notifications",
          exact: true,
          icon: <IncreaseIcon className="h-5 w-5" />,
          iconSelected: <IncreaseIconFilled className="h-5 w-5" />,
        },
        {
          name: "Subscribers",
          href: params.tenant ? `/app/${params.tenant}/notifications/subscribers` : "/admin/notifications/subscribers",
          icon: <EarIcon className="h-5 w-5" />,
          iconSelected: <EarIconFilled className="h-5 w-5" />,
        },
        {
          name: "Messages",
          href: params.tenant ? `/app/${params.tenant}/notifications/messages` : "/admin/notifications/messages",
          icon: <AlarmIcon className="h-5 w-5" />,
          iconSelected: <AlarmIconFilled className="h-5 w-5" />,
        },
        {
          name: "Channels",
          href: params.tenant ? `/app/${params.tenant}/notifications/channels` : "/admin/notifications/channels",
          icon: <ChannelIcon className="h-5 w-5" />,
          iconSelected: <ChannelIconFilled className="h-5 w-5" />,
        },
      ]}
    >
      {children}
    </SidebarIconsLayout>
  );
}
