import * as React from "react";

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { SidebarGroupDto } from "@/lib/sidebar/SidebarGroupDto";
import SidebarIcon from "../../icons/SidebarIcon";
import Link from "next/link";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { Button } from "@/components/ui/button";

export function NavSecondary({
  item,
  ...props
}: {
  // items: {
  //   title: string;
  //   url: string;
  //   icon: LucideIcon;
  // }[];
  item: SidebarGroupDto;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const appOrAdminData = useAppOrAdminData();
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {appOrAdminData?.onboardingSession?.onboarding && (
            <Button variant="outline" size="sm">
              <div>{appOrAdminData.onboardingSession.onboarding.title}</div>
            </Button>
          )}
          {item.items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.path}>
                  {/* <item.icon /> */}
                  {(item.icon !== undefined || item.entityIcon !== undefined) && <SidebarIcon className="h-5 w-5 " item={item} />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
