"use client";

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GearIcon from "@/components/ui/icons/GearIcon";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import UrlUtils from "@/utils/app/UrlUtils";
import UserUtils from "@/utils/app/UserUtils";
import { useRootData } from "@/lib/state/useRootData";
import DarkModeToggle from "@/components/ui/toggles/DarkModeToggle";
import { DARK_MODE_IN_APP } from "@/lib/constants";

export function NavUser({
  user,
  layout,
}: {
  user: { email: string; firstName: string | null; lastName: string | null; avatar: string | null; admin?: { userId: string } | null };
  layout: "app" | "admin" | "docs";
}) {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const { userSession } = useRootData();

  const params = useParams();
  let pathname = usePathname();

  const onThemeToggle = async () => {
    const isDarkMode = userSession?.lightOrDarkMode === "dark";
    
    // Call the server action to toggle theme
    try {
      await fetch("/api/toggle-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lightOrDarkMode: isDarkMode ? "light" : "dark" }),
      });
      
      // Reload to apply theme
      window.location.reload();
    } catch (error) {
      console.error("Failed to toggle theme:", error);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar || ""} alt={UserUtils.fullName(user)} />
                <AvatarFallback className="rounded-lg">{UserUtils.avatarText(user)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{UserUtils.fullName(user)}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar || ""} alt={UserUtils.fullName(user)} />
                  <AvatarFallback className="rounded-lg">{UserUtils.avatarText(user)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{UserUtils.fullName(user)}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {layout === "app" ? (
              <Fragment>
                <DropdownMenuGroup>
                  <Link href={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, `settings/profile`)}>
                    <DropdownMenuItem>
                      <GearIcon className="mr-2 h-4 w-4" />
                      {t("app.navbar.profile")}
                    </DropdownMenuItem>
                  </Link>
                  <Link href={UrlUtils.currentTenantUrl(params, `settings/subscription`)}>
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {t("app.navbar.subscription")}
                    </DropdownMenuItem>
                  </Link>
                  <Link href={UrlUtils.currentTenantUrl(params, `settings/account`)}>
                    <DropdownMenuItem>
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      {t("app.navbar.tenant")}
                    </DropdownMenuItem>
                  </Link>

                  {/* <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem> */}
                </DropdownMenuGroup>
              </Fragment>
            ) : layout === "admin" ? (
              <Fragment>
                <DropdownMenuGroup>
                  <Link href="/admin/settings/profile">
                    <DropdownMenuItem>
                      <GearIcon className="mr-2 h-4 w-4" />
                      {t("app.navbar.profile")}
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
              </Fragment>
            ) : null}

            {DARK_MODE_IN_APP && (
              <DropdownMenuItem className="gap-2" onClick={onThemeToggle}>
                <DarkModeToggle className="mr-2 size-4" />
                {userSession?.lightOrDarkMode === "dark" ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />

            <Link href="/logout">
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                {t("app.navbar.signOut")}
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
