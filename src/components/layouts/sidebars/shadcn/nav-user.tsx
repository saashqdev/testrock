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
import { actionToggleScheme } from "@/app/(marketing)/actions";

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
  const pathname = usePathname();

  const onThemeToggle = async () => {
    const formData = new FormData();
    formData.append("redirectTo", pathname || "/");
    await actionToggleScheme(formData);
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
              <DropdownMenuItem onClick={onThemeToggle}>
                {userSession?.lightOrDarkMode === "dark" ? (
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                    />
                  </svg>
                )}
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
