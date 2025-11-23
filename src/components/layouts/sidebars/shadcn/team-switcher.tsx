"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import { useAppData } from "@/lib/state/useAppData";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import clsx from "clsx";

export function TeamSwitcher({ tenants, size = "md" }: { tenants: TenantDto[]; size?: "sm" | "md" }) {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();

  const appData = useAppData();
  const pathname = usePathname();
  const router = useRouter();

  const [activeTenant, setActiveTeam] = React.useState(appData?.currentTenant);

  const activeTenantDescription = appData?.mySubscription?.products.length
    ? t(appData.mySubscription.products.find((f) => f)?.subscriptionProduct.title || "")
    : t("settings.subscription.noSubscription");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size={size === "md" ? "lg" : "default"}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div
                className={clsx(
                  "aspect-square flex items-center justify-center rounded-lg",
                  size === "sm" && "size-6",
                  size === "md" && "size-8 text-foreground"
                )}
              >
                {/* <activeTeam.logo className="size-4" /> */}
                {activeTenant?.icon ? (
                  <Image className="size-7 shrink-0 rounded-md" src={activeTenant.icon} alt={activeTenant.name} width={28} height={28} />
                ) : (
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-primary">
                    <span className="text-xs font-medium uppercase leading-none text-primary-foreground">{activeTenant?.name.substring(0, 1)}</span>
                  </span>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{activeTenant?.name}</span>
                {size === "md" && <span className="truncate text-xs">{activeTenantDescription}</span>}
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">{t("models.tenant.plural")}</DropdownMenuLabel>
            {tenants.map((tenant, index) => (
              <DropdownMenuItem
                key={tenant.id}
                onClick={() => {
                  router.push(
                    pathname
                      .replace(`/app/${appData?.currentTenant.slug}`, `/app/${tenant.slug}`)
                      .replace(`/app/${appData?.currentTenant.id}`, `/app/${tenant.slug}`)
                  );
                }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  {/* <team.logo className="size-4 shrink-0" /> */}

                  {tenant.icon ? (
                    <Image className="size-4 shrink-0" src={tenant.icon} alt={tenant.name} width={16} height={16} />
                  ) : (
                    <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-md">
                      <span className="text-xs font-medium uppercase leading-none">{tenant.name.substring(0, 1)}</span>
                    </span>
                  )}
                </div>
                {tenant.name}
                {/* <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Link href="/new-account">
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">{t("app.tenants.create.title")}</div>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
