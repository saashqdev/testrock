"use client";

import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from "../../../ui/sidebar";
import { ShadcnAppSidebar } from "./app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SideBarItem } from "@/lib/sidebar/SidebarItem";
import { useParams } from "next/navigation";
import { useTitleData } from "@/lib/state/useTitleData";
import { useRef, useState, useEffect } from "react";
import { NavActions } from "./nav-actions";
import { NavSecondary } from "./nav-secondary";
import { useKBar } from "kbar";
import OnboardingSession from "@/modules/onboarding/components/OnboardingSession";
import { Separator } from "@/components/ui/separator";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { useRootData } from "@/lib/state/useRootData";
import { AdminSidebar } from "@/lib/sidebar/AdminSidebar";
import { AppSidebar } from "@/lib/sidebar/AppSidebar";
import { DocsSidebar } from "@/lib/sidebar/DocsSidebar";
import { SidebarGroupDto } from "@/lib/sidebar/SidebarGroupDto";
import { SidebarTitleContext } from "@/lib/state/useSidebarTitle";

export default function ShadcnSidebarLayout({
  children,
  layout,
  menuItems,
}: {
  children: React.ReactNode;
  layout: "app" | "admin" | "docs";
  menuItems?: SideBarItem[];
}) {
  const params = useParams();
  const pageTitle = useTitleData() ?? "";
  const rootData = useRootData();
  const appOrAdminData = useAppOrAdminData();

  const mainElement = useRef<HTMLElement>(null);

  const { query } = useKBar();

  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSidebarTitle, setActiveSidebarTitle] = useState("");
  const [activeSidebarParentTitle, setActiveSidebarParentTitle] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use sidebar title if available, otherwise fall back to page title
  const displayTitle = activeSidebarTitle || pageTitle;
  const hasParentTitle = activeSidebarParentTitle && activeSidebarTitle;

  function onOpenCommandPalette() {
    query.toggle();
  }

  // Get secondary menu items
  const getSecondaryMenu = (): SidebarGroupDto | null => {
    let menu: SideBarItem[] = [];
    if (menuItems) {
      menu = menuItems;
    } else if (layout === "admin") {
      menu = AdminSidebar({ appConfiguration: rootData.appConfiguration, myTenants: appOrAdminData?.myTenants });
    } else if (layout === "app") {
      menu = AppSidebar({
        tenantId: Array.isArray(params.tenant) ? params.tenant[0] : params.tenant ?? "",
        entities: appOrAdminData?.entities ?? [],
        entityGroups: appOrAdminData?.entityGroups ?? [],
        appConfiguration: rootData.appConfiguration,
      });
    } else if (layout === "docs") {
      menu = DocsSidebar();
    }

    const secondaryGroup = menu.find((item) => item.isSecondary);
    if (!secondaryGroup || !secondaryGroup.items || secondaryGroup.items.length === 0) {
      return null;
    }

    return {
      title: secondaryGroup.title?.toString() || "",
      items: secondaryGroup.items,
      type: "secondary",
    };
  };

  const navSecondary = getSecondaryMenu();

  return (
    <div suppressHydrationWarning>
      <SidebarTitleContext.Provider 
        value={{ 
          activeTitle: activeSidebarTitle, 
          activeParentTitle: activeSidebarParentTitle,
          setActiveTitle: (title: string, parentTitle?: string) => {
            setActiveSidebarTitle(title);
            setActiveSidebarParentTitle(parentTitle || "");
          }
        }}
      >
        <SidebarProvider>
          <OnboardingSession open={onboardingModalOpen} setOpen={setOnboardingModalOpen} />
          <ShadcnAppSidebar layout={layout} items={menuItems} />
          <SidebarInset className="overflow-hidden">
            <header className="bg-white border-border flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 truncate px-4">
                <SidebarTrigger className="-ml-1" />
                {displayTitle && <Separator orientation="vertical" className="mr-2 h-4" />}
                <Breadcrumb className="truncate">
                  <BreadcrumbList className="truncate">
                    {hasParentTitle ? (
                      <>
                        <BreadcrumbItem className="hidden md:block">
                          <BreadcrumbLink className="truncate">{activeSidebarParentTitle}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem className="block truncate">
                          <BreadcrumbPage className="truncate">{displayTitle}</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    ) : (
                      <BreadcrumbItem className="block truncate">
                        <BreadcrumbPage className="truncate">{displayTitle}</BreadcrumbPage>
                      </BreadcrumbItem>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="ml-auto px-3">
                <NavActions layout={layout} onOpenCommandPalette={onOpenCommandPalette} setOnboardingModalOpen={setOnboardingModalOpen} />
              </div>
            </header>
            <main ref={mainElement} className="bg-white flex-1 focus:outline-hidden" tabIndex={0}>
              <div key={params.tenant?.toString()} className="pb-20 sm:pb-0">
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </SidebarTitleContext.Provider>
    </div>
  );
}
