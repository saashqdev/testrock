"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { SidebarGroupDto } from "@/lib/sidebar/SidebarGroupDto";

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
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
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
                        <span suppressHydrationWarning>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }
              
              // Only apply defaultOpen after mount to avoid hydration mismatch
              const isActive = mounted ? item.isActive : undefined;
              
              return (
                <Collapsible key={itemKey} asChild defaultOpen={isActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} suppressHydrationWarning>
                        {/* <Link to={item.path}> */}
                        {/* <item.icon /> */}
                        {(item.icon !== undefined || item.entityIcon !== undefined) && <SidebarIcon className="size-4" item={item} />}
                        <span suppressHydrationWarning>{item.title}</span>
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
                                <span suppressHydrationWarning>{subItem.title}</span>
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
