"use client";

import { Transition } from "@headlessui/react";
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import SidebarMenu from "./SidebarMenu";
import ProfileButton from "./buttons/ProfileButton";
import QuickActionsButton from "./buttons/QuickActionsButton";
import CurrentSubscriptionButton from "./buttons/CurrentSubscriptionButton";
import TenantSelect from "./selectors/TenantSelect";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoDark from "@/assets/img/logo-dark.png";
import SearchButton from "./buttons/SearchButton";
import { useTitleData } from "@/lib/state/useTitleData";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import ChatSupportButton from "./buttons/ChatSupportButton";
import { useRootData } from "@/lib/state/useRootData";
import OnboardingButton from "./buttons/OnboardingButton";
import OnboardingSession from "@/modules/onboarding/components/OnboardingSession";
import { useKBar } from "kbar";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import AddFeedbackButton from "./buttons/AddFeedbackButton";
import { SideBarItem } from "@/lib/sidebar/SidebarItem";
import clsx from "clsx";
import ThemeSelector from "../ui/selectors/ThemeSelector";
import { Inbox } from "@novu/react";

interface Props {
  layout: "app" | "admin" | "docs";
  children: ReactNode;
  menuItems?: SideBarItem[];
  className?: string;
}

export default function SidebarLayout({ layout, children, menuItems, className = "h-screen" }: Props) {
  const { query } = useKBar();

  const rootData = useRootData();
  const appOrAdminData = useAppOrAdminData();
  const { appConfiguration } = useRootData();
  const params = useParams();
  const title = useTitleData() ?? "";

  const mainElement = useRef<HTMLElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

  useEffect(() => {
    try {
      // @ts-ignore
      $crisp?.push(["do", "chat:hide"]);
    } catch (e) {
      // ignore
    }
  }, []);

  function onOpenCommandPalette() {
    query?.toggle?.();
  }

  function getLogoDarkMode() {
    if (appConfiguration?.branding?.logoDarkMode?.length) {
      return appConfiguration?.branding?.logoDarkMode;
    }
    if (appConfiguration?.branding?.logo?.length) {
      return appConfiguration?.branding?.logo;
    }
    return LogoDark;
  }
  return (
    <Fragment>
      <OnboardingSession open={onboardingModalOpen} setOpen={setOnboardingModalOpen} />
      {/* <WarningBanner title="Onboarding" text={appOrAdminData?.onboarding?.onboarding.title ?? "No onboarding"} /> */}

      <div
        suppressHydrationWarning
        className={clsx("flex overflow-hidden bg-secondary/90 text-foreground", className)}
        style={{
          colorScheme: "light",
        }}
      >
        {/*Mobile sidebar */}
        <div className="md:hidden">
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 flex">
              <Transition
                as={Fragment}
                show={sidebarOpen}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0">
                  <div className="absolute inset-0 bg-foreground/90 opacity-75" />
                </div>
              </Transition>

              <Transition
                as={Fragment}
                show={sidebarOpen}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-900">
                  <div className="absolute right-0 top-0 -mr-14 mt-2 p-1">
                    <button
                      className="focus:outline-hidden flex h-12 w-12 items-center justify-center rounded-sm focus:bg-gray-600"
                      aria-label="Close sidebar"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                      <svg className="h-7 w-7 text-white" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-5 h-0 flex-1 overflow-y-auto">
                    <nav className="space-y-3 px-2">
                      <div className="flex flex-col space-y-2">
                        <Link href={"/"}>
                          <Image
                            className={"mx-auto h-8 w-auto"}
                            src={appConfiguration?.branding?.logoDarkMode || appConfiguration?.branding?.logo || LogoDark}
                            alt="Logo"
                          />
                        </Link>
                      </div>
                      <SidebarMenu layout={layout} onSelected={() => setSidebarOpen(!sidebarOpen)} menuItems={menuItems} />
                    </nav>
                  </div>
                  {layout == "app" && <TenantSelect onOpenCommandPalette={onOpenCommandPalette} />}
                </div>
              </Transition>
              <div className="w-14 shrink-0">{/*Dummy element to force sidebar to shrink to fit close icon */}</div>
            </div>
          )}
        </div>

        {/*Desktop sidebar */}
        <div
          className={
            sidebarOpen
              ? "hidden transition duration-1000 ease-in"
              : "shadow-2xs hidden overflow-x-hidden border-r border-border dark:border-r-0 dark:border-border dark:shadow-lg md:flex md:shrink-0"
          }
        >
          <div className="flex w-64 flex-col">
            <div className="flex h-0 flex-1 flex-col bg-theme-600 shadow-md">
              <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 select-none space-y-3 bg-gray-900 px-2 py-4">
                  <div className="flex flex-col space-y-2">
                    <Link href={"/"}>
                      <Image className={"mx-auto h-8 w-auto"} src={getLogoDarkMode()} alt="Logo" />
                    </Link>
                  </div>
                  <SidebarMenu layout={layout} menuItems={menuItems} />
                </nav>
              </div>
            </div>

            {layout == "app" && <TenantSelect onOpenCommandPalette={onOpenCommandPalette} />}
          </div>
        </div>

        {/*Content */}
        <div className="flex w-0 flex-1 flex-col overflow-hidden">
          <div className="relative flex h-14 shrink-0 border-b border-border bg-background shadow-inner">
            <button
              className="focus:outline-hidden border-r border-border px-4 text-muted-foreground focus:bg-secondary/90 focus:text-muted-foreground"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>

            <NavBar
              layout={layout}
              title={title}
              buttons={{
                mySubscription: getUserHasPermission(appOrAdminData, "app.settings.subscription.update"),
                feedback: rootData.appConfiguration?.app.features.tenantFeedback,
                chatSupport: !!rootData.chatWebsiteId,
                quickActions: (appOrAdminData?.entities?.filter((f) => f.showInSidebar)?.length ?? 0) > 0,
                search: true,
                notifications: appConfiguration?.notifications?.enabled && (layout === "admin" || layout === "app"),
                onboarding: appConfiguration?.onboarding?.enabled ?? false,
              }}
              onOpenCommandPalette={onOpenCommandPalette}
              onOpenOnboardingModal={() => setOnboardingModalOpen(true)}
            />
          </div>

          <main ref={mainElement} className="focus:outline-hidden flex-1 overflow-y-auto bg-secondary" tabIndex={0}>
            <div key={Array.isArray(params?.tenant) ? params.tenant.join("-") : params?.tenant} className="pb-20 sm:pb-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Fragment>
  );
}

function NavBar({
  layout,
  title,
  buttons,
  onOpenCommandPalette,
  onOpenOnboardingModal,
}: {
  layout?: string;
  title?: string;
  buttons: {
    mySubscription: boolean;
    feedback: boolean;
    chatSupport: boolean;
    quickActions: boolean;
    search: boolean;
    notifications: boolean;
    onboarding: boolean;
  };
  onOpenCommandPalette: () => void;
  onOpenOnboardingModal: () => void;
}) {
  const appOrAdminData = useAppOrAdminData();
  const rootData = useRootData();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-1 justify-between space-x-2 px-3">
      <div className="flex flex-1 items-center">
        <div className="font-extrabold">{title}</div>
      </div>
      <div className="flex items-center space-x-2 md:ml-6">
        {buttons.onboarding && appOrAdminData?.onboardingSession && (
          <OnboardingButton item={appOrAdminData?.onboardingSession} onClick={onOpenOnboardingModal} />
        )}
        {layout === "app" && buttons.mySubscription && <CurrentSubscriptionButton />}
        {buttons.notifications && appOrAdminData?.user && rootData?.appConfiguration?.notifications?.novuAppId && isMounted && (
          <Inbox
            applicationIdentifier={rootData.appConfiguration.notifications.novuAppId}
            subscriberId={appOrAdminData.user.id}
            routerPush={(path: string) => router.push(path)}
          />
        )}
        {buttons.search && <SearchButton onClick={onOpenCommandPalette} />}
        {layout === "app" && buttons.feedback && <AddFeedbackButton />}
        {layout === "app" && buttons.chatSupport && <ChatSupportButton />}
        {layout === "app" && buttons.quickActions && <QuickActionsButton entities={appOrAdminData?.entities?.filter((f) => f.showInSidebar) || []} />}
        {(layout === "app" || layout === "admin") && <ThemeSelector variant="secondary" />}
        {(layout === "app" || layout === "admin") && <ProfileButton user={appOrAdminData?.user} layout={layout} />}
      </div>
    </div>
  );
}
