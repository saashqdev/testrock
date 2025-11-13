"use client";

import * as React from "react";
import LogoDark from "@/assets/img/logo-dark.png";
import LogoLight from "@/assets/img/logo-light.png";
import { NavMain } from "./nav-main";
import { NavQuickLinks } from "./nav-quick-links";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { AppSidebar } from "@/lib/sidebar/AppSidebar";
import { useTranslation } from "react-i18next";
import { useRootData } from "@/lib/state/useRootData";
import { SideBarItem } from "@/lib/sidebar/SidebarItem";
import { AdminSidebar } from "@/lib/sidebar/AdminSidebar";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { DocsSidebar } from "@/lib/sidebar/DocsSidebar";
import UrlUtils from "@/utils/app/UrlUtils";
import { SidebarGroupDto } from "@/lib/sidebar/SidebarGroupDto";
import { TeamSwitcher } from "./team-switcher";
import { DARK_SIDEBAR_IN_LIGHT_MODE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ShadcnAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  layout: "app" | "admin" | "docs";
  items?: SideBarItem[];
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const rootData = useRootData();
  const appOrAdminData = useAppOrAdminData();
  const params = useParams();
  const appConfiguration = rootData.appConfiguration;

  const getMenuItems = () => {
    let menu: SideBarItem[] = [];
    if (props.items) {
      menu = props.items;
    } else if (props.layout === "admin") {
      menu = AdminSidebar({ appConfiguration: rootData.appConfiguration });
    } else if (props.layout === "app") {
      menu = AppSidebar({
        tenantId: Array.isArray(params.tenant) ? params.tenant[0] : params.tenant ?? "",
        entities: appOrAdminData?.entities ?? [],
        entityGroups: appOrAdminData?.entityGroups ?? [],
        appConfiguration: rootData.appConfiguration,
      });
    } else if (props.layout === "docs") {
      menu = DocsSidebar();
    }

    function clearItemsIfNotCollapsible(items: SideBarItem[]) {
      items.forEach((item) => {
        if (item.isCollapsible !== undefined && !item.isCollapsible) {
          item.items = [];
        }
        if (item.items) {
          clearItemsIfNotCollapsible(item.items);
        }
      });
    }
    clearItemsIfNotCollapsible(menu);

    menu.forEach((item) => {
      if (item.isCollapsible !== undefined && !item.isCollapsible) {
        item.items = [];
      }
      item.items?.forEach((subitem) => {
        if (subitem.isCollapsible !== undefined && !subitem.isCollapsible) {
          subitem.items = [];
        }
      });
    });
    // setMenu(layout === "admin" ? AdminSidebar : );
    menu.forEach((group) => {
      group.items?.forEach((element) => {
        if (element.open || isCurrent(element) || currentIsChild(element)) {
          // expanded.push(element.path);
        } else {
          // setExpanded(expanded.filter((f) => f !== element.path));
        }
      });
    });

    return menu || [];
  };

  function getPath(item: SideBarItem) {
    return UrlUtils.replaceVariables(params, item.path) ?? "";
  }

  function isCurrent(menuItem: SideBarItem) {
    if (menuItem.path) {
      if (menuItem.exact) {
        return pathname === getPath(menuItem);
      }
      return pathname?.includes(getPath(menuItem));
    }
  }

  function currentIsChild(menuItem: SideBarItem) {
    let hasOpenChild = false;
    menuItem.items?.forEach((item) => {
      if (isCurrent(item)) {
        hasOpenChild = true;
      }
    });
    return hasOpenChild;
  }
  function allowCurrentUserType(item: SideBarItem) {
    if (!item.adminOnly) {
      return true;
    }
    return appOrAdminData?.user?.admin !== null;
  }
  function allowCurrentTenantUserType(item: SideBarItem) {
    // currentRole is only available in app layout (AppLoaderData)
    if (props.layout !== "app") {
      return !item.tenantUserTypes; // If not in app layout, only show items without tenant user type restrictions
    }
    const currentRole = (appOrAdminData as any)?.currentRole;
    return !item.tenantUserTypes || (currentRole !== undefined && item.tenantUserTypes.includes(currentRole));
  }
  function checkUserRolePermissions(item: SideBarItem) {
    return !item.permission || appOrAdminData?.permissions?.includes(item.permission) || appOrAdminData?.permissions?.includes(item.permission);
  }
  function checkFeatureFlags(item: SideBarItem) {
    return !item.featureFlag || rootData.featureFlags?.includes(item.featureFlag);
  }
  const getMenu = (): SidebarGroupDto[] => {
    function filterItem(f: SideBarItem) {
      return f.hidden !== true && allowCurrentUserType(f) && allowCurrentTenantUserType(f) && checkUserRolePermissions(f) && checkFeatureFlags(f);
    }
    const _menu: SidebarGroupDto[] = [];
    getMenuItems()
      .filter((f) => filterItem(f))
      .forEach((f) => {
        let type: "main" | "secondary" | "quick-link" = "main";
        if (f.isSecondary) {
          type = "secondary";
        } else if (f.isQuickLink) {
          type = "quick-link";
        }
        _menu.push({
          title: f.title.toString(),
          items:
            f.items
              ?.filter((f) => filterItem(f))
              .map((f) => {
                return {
                  ...f,
                  items: f.items?.filter((f) => filterItem(f)),
                };
              }) ?? [],
          type,
        });
      });
    return _menu.filter((f) => f.items.length > 0);
  };

  const navMain = getMenu().filter((f) => f.type === "main");
  const navSecondary = getMenu().find((f) => f.type === "secondary") || { items: [] };
  const navQuickLinks = getMenu().find((f) => f.type === "quick-link");

  return (
    <Sidebar
      variant={DARK_SIDEBAR_IN_LIGHT_MODE ? "sidebar" : "inset"}
      collapsible="offcanvas"
      {...props}
      className={cn(DARK_SIDEBAR_IN_LIGHT_MODE && "dark")} // force dark mode
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              // className="dark:hover:bg-transparent dark:active:bg-transparent"
            >
              <Link href={"/"} className="flex justify-center">
                <div className="flex shrink-0 items-center justify-center border-b border-transparent">
                  {/* <Logo size="h-8 p-1 w-auto" /> */}
                  <Image
                    className={"mx-auto hidden h-10 w-auto p-1.5 dark:flex"}
                    src={appConfiguration?.branding?.logoDarkMode || appConfiguration?.branding?.logo || LogoDark}
                    alt="Logo"
                  />
                  <Image
                    className={"mx-auto h-10 w-auto p-1.5 dark:hidden"}
                    src={appConfiguration?.branding?.logoDarkMode || appConfiguration?.branding?.logo || LogoLight}
                    alt="Logo"
                  />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* {props.layout === "app" && (
          <SidebarMenu>
            <div>{appOrAdminData?.currentTenant && <NewTenantSelector key={params.tenant} />}</div>
          </SidebarMenu>
        )} */}
        {props.layout === "app" && appOrAdminData?.currentTenant && <TeamSwitcher key={Array.isArray(params.tenant) ? params.tenant[0] : params.tenant} size="md" tenants={appOrAdminData?.myTenants ?? []} />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {navQuickLinks && <NavQuickLinks item={navQuickLinks} />}
        <NavSecondary item={navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        {appOrAdminData?.user && <NavUser layout={props.layout} user={appOrAdminData.user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
