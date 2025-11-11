"use client";

import { useRouter } from "next/navigation";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { useRootData } from "@/lib/state/useRootData";
import AddFeedbackButton from "./buttons/AddFeedbackButton";
import ChatSupportButton from "./buttons/ChatSupportButton";
import CurrentSubscriptionButton from "./buttons/CurrentSubscriptionButton";
import OnboardingButton from "./buttons/OnboardingButton";
import ProfileButton from "./buttons/ProfileButton";
import QuickActionsButton from "./buttons/QuickActionsButton";
import SearchButton from "./buttons/SearchButton";
import { Inbox } from "@novu/react";
import NotificationsButton from "./buttons/NotificationsButton";

export default function NavBar({
  layout,
  title,
  buttons,
  onOpenCommandPalette,
  onOpenOnboardingModal,
  children,
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
    userProfile: boolean;
  };
  onOpenCommandPalette: () => void;
  onOpenOnboardingModal: () => void;
  children?: React.ReactNode;
}) {
  const appOrAdminData = useAppOrAdminData();
  const rootData = useRootData();
  const router = useRouter();
  return (
    <div className="flex flex-1 justify-between space-x-2">
      <div className="flex flex-1 items-center">{title && <div className="font-extrabold">{title}</div>}</div>
      <div className="flex items-center space-x-2 md:ml-6">
        {/* {layout === "app" && (
          <CreditsRemaining
            feature={appOrAdminData.featureSyncs}
            redirectTo={appOrAdminData.currentTenant ? `/app/${appOrAdminData.currentTenant.slug}/settings/subscription` : "/settings/subscription"}
          />
        )} */}
        {buttons.onboarding && appOrAdminData?.onboardingSession && (
          <OnboardingButton item={appOrAdminData?.onboardingSession} onClick={onOpenOnboardingModal} />
        )}
        {layout === "app" && buttons.mySubscription && <CurrentSubscriptionButton />}
        {/* <LocaleSelector /> */}
        {buttons.notifications && appOrAdminData?.user && (
          <Inbox
            applicationIdentifier={rootData?.appConfiguration?.notifications?.novuAppId || ""}
            subscriberId={appOrAdminData?.user.id || ""}
            routerPush={(path: string) => router.push(path)}
            appearance={{ elements: { popoverTrigger: { padding: "0rem" } } }}
            renderBell={(unreadCount) => {
              const count = typeof unreadCount === "number" ? unreadCount : (unreadCount as any)?.total ?? 0;
              return (
                <div>
                  <NotificationsButton unseenCount={count} />
                </div>
              );
            }}
          ></Inbox>
        )}
        {buttons.search && <SearchButton onClick={onOpenCommandPalette} />}
        {layout === "app" && buttons.feedback && <AddFeedbackButton />}
        {layout === "app" && buttons.chatSupport && <ChatSupportButton />}
        {layout === "app" && buttons.quickActions && <QuickActionsButton entities={appOrAdminData?.entities?.filter((f) => f.showInSidebar) || []} />}
        {/* {(layout === "app" || layout === "admin") && <ThemeSelector variant="secondary" />} */}
        {(layout === "app" || layout === "admin") && buttons.userProfile && <ProfileButton user={appOrAdminData?.user} layout={layout} />}
        {children}
      </div>
    </div>
  );
}
