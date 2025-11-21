"use client";

import { Folder, MoreHorizontal, Share, Trash2, type LucideIcon } from "lucide-react";
import { SidebarGroupDto } from "@/lib/sidebar/SidebarGroupDto";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import SidebarIcon from "../../icons/SidebarIcon";
import { useTranslation } from "react-i18next";

export function NavQuickLinks({
  item,
}: {
  // items: {
  //   name: string;
  //   url: string;
  //   icon: LucideIcon;
  // }[];
  item: SidebarGroupDto;
}) {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{t(item.title)}</SidebarGroupLabel>
      <SidebarMenu>
        {item.items.map((item) => (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton asChild>
              <a href={item.path}>
                {(item.icon !== undefined || item.entityIcon !== undefined) && <SidebarIcon className="size-4 shrink-0" item={item} />}
                <span>{t(item.title)}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
