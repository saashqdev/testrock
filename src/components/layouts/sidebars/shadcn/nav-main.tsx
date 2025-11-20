"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { SidebarGroupDto } from "@/lib/sidebar/SidebarGroupDto";
import { useTranslation } from "react-i18next";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import SidebarIcon from "../../icons/SidebarIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarTitle } from "@/lib/state/useSidebarTitle";

export function NavMain({
  items,
}: {
  // items: {
  //   title: string;
  //   url: string;
  //   icon: LucideIcon;
  //   isActive?: boolean;
  //   items?: {
  //     title: string;
  //     url: string;
  //   }[];
  // }[];
  items: SidebarGroupDto[];
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { setActiveTitle } = useSidebarTitle();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update active title when pathname changes
  useEffect(() => {
    if (!mounted) return;
    
    let bestMatch: { title: string; parentTitle?: string; pathLength: number } | null = null;
    
    // Find the active menu item based on pathname
    for (const group of items) {
      for (const item of group.items) {
        // Check sub-items first (more specific match)
        if (item.items && item.items.length > 0) {
          for (const subItem of item.items) {
            if (subItem.path && pathname) {
              const matchesExact = pathname === subItem.path;
              const matchesPrefix = pathname.startsWith(subItem.path);
              
              if (matchesExact || matchesPrefix) {
                const pathLength = subItem.path.length;
                // Keep the longest matching path (most specific)
                if (!bestMatch || pathLength > bestMatch.pathLength) {
                  bestMatch = {
                    title: t(subItem.title),
                    parentTitle: t(item.title),
                    pathLength,
                  };
                }
              }
            }
          }
        }
        
        // Check main items
        if (item.path && pathname) {
          const matchesExact = pathname === item.path;
          const matchesPrefix = pathname.startsWith(item.path);
          
          if (matchesExact || matchesPrefix) {
            const pathLength = item.path.length;
            // Only use if no better match found
            if (!bestMatch || (pathLength > bestMatch.pathLength && !bestMatch.parentTitle)) {
              bestMatch = {
                title: t(item.title),
                pathLength,
              };
            }
          }
        }
      }
    }
    
    if (bestMatch) {
      setActiveTitle(bestMatch.title, bestMatch.parentTitle);
    }
  }, [pathname, items, mounted, t, setActiveTitle]);

  return (
    <Fragment>
      {/* <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <a href={subItem.url}>
                                <span>{subItem.title}</span>
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup> */}

      {items.map((group, idxGroup) => (
        <SidebarGroup key={`group-${idxGroup}-${group.title || ''}`}>
          {group.title && <SidebarGroupLabel>{t(group.title)}</SidebarGroupLabel>}
          <SidebarMenu>
            {group.items.map((item, idx) => {
              const itemKey = `item-${idxGroup}-${idx}-${item.path}`;
              const hasSubItems = item.items && item.items.length > 0;
              
              if (!hasSubItems) {
                return (
                  <SidebarMenuItem key={itemKey}>
                    <SidebarMenuButton asChild suppressHydrationWarning>
                      <Link href={item.path}>
                        {/* <item.icon /> */}
                        {(item.icon !== undefined || item.entityIcon !== undefined) && <SidebarIcon className="size-4" item={item} />}
                        <span suppressHydrationWarning>{t(item.title)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }
              
              // Only apply defaultOpen after mount to avoid hydration mismatch
              const isActive = mounted ? item.isActive : false;
              
              return (
                <Collapsible key={itemKey} asChild defaultOpen={isActive} className="group/collapsible" suppressHydrationWarning>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={t(item.title)} suppressHydrationWarning>
                        {/* <Link to={item.path}> */}
                        {/* <item.icon /> */}
                        {(item.icon !== undefined || item.entityIcon !== undefined) && <SidebarIcon className="size-4" item={item} />}
                        <span suppressHydrationWarning>{t(item.title)}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />

                        {/* </Link> */}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem, subIdx) => (
                          <SidebarMenuSubItem key={`subitem-${idxGroup}-${idx}-${subIdx}-${subItem.path}`}>
                            <SidebarMenuSubButton asChild suppressHydrationWarning>
                              <Link href={subItem.path}>
                                <span suppressHydrationWarning>{t(subItem.title)}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </Fragment>
  );
}
