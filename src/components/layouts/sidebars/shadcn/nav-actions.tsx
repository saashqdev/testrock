"use client";

import * as React from "react";
import { CreditCard, LogOut, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import NavBar from "../../NavBar";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { useRootData } from "@/lib/state/useRootData";
import { usePathname, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import UrlUtils from "@/lib/utils/UrlUtils";
import { GearIcon } from "@radix-ui/react-icons";
import { Inbox } from "@novu/react";
import { dark } from "@novu/react/themes";
import Modal from "@/components/ui/modals/Modal";
import StarsIconFilled from "@/components/ui/icons/StarsIconFilled";
import { useAppData } from "@/lib/state/useAppData";
import OnboardingButton from "../../buttons/OnboardingButton";
import AddFeedbackButton from "../../buttons/AddFeedbackButton";
import ThemeSelector from "@/components/ui/selectors/ThemeSelector";
import { toast } from "sonner";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { Textarea } from "@/components/ui/textarea";

export function NavActions({
  layout,
  onOpenCommandPalette,
  setOnboardingModalOpen,
}: {
  layout: "admin" | "app" | "docs";
  onOpenCommandPalette: () => void;
  setOnboardingModalOpen: (value: boolean) => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  // const title = useTitleData() ?? "";

  const appOrAdminData = useAppOrAdminData();
  const rootData = useRootData();
  const appConfiguration = rootData.appConfiguration;
  const params = useParams();

  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  function hasSubscription() {
    // Only check subscription in app layout context
    if (layout !== "app") return false;
    const myProducts = (appOrAdminData as any)?.mySubscription?.products.map((f: any) => t(f.subscriptionProduct.title)) ?? [];
    return myProducts.length > 0;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {false && (
        <NavBar
          layout={layout}
          // title={title}
          buttons={{
            mySubscription: getUserHasPermission(appOrAdminData, "app.settings.subscription.update"),
            feedback: rootData?.appConfiguration?.app?.features?.tenantFeedback,
            chatSupport: !!rootData.chatWebsiteId,
            quickActions: (appOrAdminData?.entities?.filter((f) => f.showInSidebar).length ?? 0) > 0,
            search: true,
            notifications: appConfiguration?.notifications?.enabled && (layout === "admin" || layout === "app"),
            onboarding: appConfiguration?.onboarding?.enabled,
            userProfile: false,
          }}
          onOpenCommandPalette={onOpenCommandPalette}
          onOpenOnboardingModal={() => setOnboardingModalOpen(true)}
        ></NavBar>
      )}

      <div className="flex items-center space-x-2 md:ml-6">
        {mounted && appConfiguration?.onboarding?.enabled && appOrAdminData?.onboardingSession && (
          <OnboardingButton item={appOrAdminData?.onboardingSession} onClick={() => setOnboardingModalOpen(true)} />
        )}

        {/* NavBar Button: My Subscription */}
        {layout === "app" && getUserHasPermission(appOrAdminData, "app.settings.subscription.update") && (
          <React.Fragment>
            {!hasSubscription() && (
              <Link href={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, "pricing")}>
                <Button variant="outline" size="sm">
                  <span>{t("pricing.subscribe")} </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </Link>
            )}
          </React.Fragment>
        )}

        {/* NavBar Button: Notifications */}
        {mounted &&
          appConfiguration?.notifications?.enabled &&
          rootData?.appConfiguration?.notifications?.novuAppId &&
          (layout === "admin" || layout === "app") &&
          appOrAdminData?.user && (
            <Inbox
              applicationIdentifier={rootData.appConfiguration.notifications.novuAppId}
              subscriberId={appOrAdminData.user.id}
              routerPush={(path: string) => router.push(path)}
            />
          )}

        {/* NavBar Button: Search */}
        <Button variant="ghost" size="icon" onClick={onOpenCommandPalette} className="text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </Button>

        {/* NavBar Button: Feedback */}
        {appConfiguration?.app?.features?.tenantFeedback && layout === "app" && <AddFeedbackButton />}

        {/* NavBar Button: Chat Support */}
        {(layout === "app" || layout === "admin") && !!rootData.chatWebsiteId && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => {
              try {
                // @ts-ignore
                $crisp?.push(["do", "chat:open"]);
                // @ts-ignore
                $crisp?.push(["do", "chat:show"]);
              } catch (e) {
                // ignore
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </Button>
        )}

        {/* NavBar Button: Profile */}
        {/* {(layout === "app" || layout === "admin") && <ProfileButton user={appOrAdminData?.user} layout={layout} />} */}

        {/* NavBar Button: Theme Selector */}
        <ThemeSelector variant="secondary" />

        {/* NavBar Button: Quick Actions */}
        {/* {layout === "app" && <QuickActionsButton entities={appOrAdminData?.entities?.filter((f) => f.showInSidebar)} />} */}

        {/* NavBar Button: More */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 data-[state=open]:bg-accent">
              <MoreHorizontal className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 overflow-hidden rounded-lg p-0" align="end">
            <Sidebar collapsible="none" className="bg-transparent">
              <SidebarContent>
                {layout === "app" ? (
                  <SidebarGroup className="border-b last:border-none">
                    <SidebarGroupContent className="gap-0">
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <Link href={!params.tenant ? "" : UrlUtils.currentTenantUrl(params, `settings/profile`)}>
                            <SidebarMenuButton>
                              <GearIcon className="mr-2 h-4 w-4" />
                              {t("app.navbar.profile")}
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                          <Link href={UrlUtils.currentTenantUrl(params, `settings/subscription`)}>
                            <SidebarMenuButton>
                              <CreditCard className="mr-2 h-4 w-4" />
                              {t("app.navbar.subscription")}
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                ) : layout === "admin" ? (
                  <SidebarGroup className="border-b last:border-none">
                    <SidebarGroupContent className="gap-0">
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <Link href="/admin/settings/profile">
                            <SidebarMenuButton>
                              <GearIcon className="mr-2 h-4 w-4" />
                              {t("app.navbar.profile")}
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                ) : null}

                <SidebarGroup className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <Link href="/logout">
                          <SidebarMenuButton>
                            <LogOut className="mr-2 h-4 w-4" />
                            {t("app.navbar.signOut")}
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function FeedbackForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const params = useParams();
  const appOrAdminData = useAppOrAdminData();
  const pathname = usePathname();

  const [isPending, startTransition] = React.useTransition();
  const [message, setMessage] = React.useState("");

  const mainInput = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        mainInput.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const response = await fetch(`/app/${params.tenant}`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          toast.success(data.success);
          setMessage("");
          onClose();
        } else if (data.error) {
          toast.error(data.error);
        }
      } catch (error) {
        toast.error("Failed to submit feedback");
      }
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <input type="hidden" name="action" value="add-feedback" readOnly hidden />
      <input type="hidden" name="tenantId" value={appOrAdminData?.currentTenant?.id} readOnly hidden />
      <input type="hidden" name="fromUrl" value={pathname} readOnly hidden />
      <div className="space-y-3">
        <h3 className="text-lg font-medium leading-6">{t("feedback.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("feedback.description")}</p>
        <Textarea
          ref={mainInput}
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder={t("feedback.placeholder")}
        />
        <div className="flex justify-between">
          <button type="button" onClick={onClose} className="text-sm text-muted-foreground hover:underline">
            {t("shared.cancel")}
          </button>
          <ButtonPrimary type="submit" disabled={isPending}>
            {isPending ? t("shared.loading") : t("feedback.send")}
          </ButtonPrimary>
        </div>
      </div>
    </form>
  );
}
