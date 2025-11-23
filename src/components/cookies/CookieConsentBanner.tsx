"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { allCookieCategories } from "@/lib/cookies/ApplicationCookies";
import { CookieCategory } from "@/lib/cookies/CookieCategory";
import { useRootData } from "@/lib/state/useRootData";
import CookieHelper from "@/lib/helpers/CookieHelper";
import OpenModal from "../ui/modals/OpenModal";
import CookieConsentSettings from "./CookieConsentSettings";
import { Button } from "../ui/button";

export default function CookieConsentBanner() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  const { userSession, appConfiguration } = useRootData();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(CookieHelper.requiresCookieConsent(userSession, searchParams));
  const [showCookieSettingsModal, setShowCookieSettingsModal] = useState(false);

  useEffect(() => {
    setIsOpen(CookieHelper.requiresCookieConsent(userSession, searchParams));
  }, [userSession, searchParams]);

  if (!appConfiguration.cookies.enabled) {
    return null;
  }

  function setCookies(selectedCookies: CookieCategory[]) {
    const form = CookieHelper.getUpdateCookieConsentForm({ selectedCookies, pathname, searchParams });

    setIsLoading(true);

    // Convert FormData to URLSearchParams for fetch
    const formData = new FormData();
    for (const [key, value] of Object.entries(form)) {
      formData.append(key, value as string);
    }

    fetch("/", {
      method: "POST",
      body: formData,
    })
      .then(() => {
        setIsLoading(false);
        // Optionally refresh the page or update state
        router.refresh();
      })
      .catch((error) => {
        console.error("Error updating cookie consent:", error);
        setIsLoading(false);
      });
  }

  return (
    <>
      {isOpen && (
        <div className="relative">
          <div className="fixed inset-x-0 bottom-0 z-30 pb-2 sm:pb-5">
            <div className="mx-auto max-w-5xl px-2 sm:px-6 lg:px-8">
              <div className="rounded-lg border border-border bg-background p-2 text-foreground shadow-lg sm:p-3">
                <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0">
                  <div className="flex items-start space-x-2">
                    <div className="rounded-full bg-primary p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-foreground" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        <span className="md:hidden"> {t("cookies.titleSmall")} </span>
                        <span className="hidden md:inline"> {t("cookies.title")} </span>
                      </p>
                      <p className="text-sm font-light text-muted-foreground">
                        <span className="md:hidden">
                          {t("cookies.descriptionSmall")}{" "}
                          <Link href="/privacy-policy" className="underline">
                            {t("shared.learnMore")}
                          </Link>
                          .{" "}
                        </span>
                        <span className="hidden md:inline">
                          {" "}
                          {t("cookies.description")}{" "}
                          <Link href="/privacy-policy" className="underline">
                            {t("shared.learnMore")}
                          </Link>{" "}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="w-full border border-t border-border sm:hidden"></div>
                  <div className="flex w-full shrink-0 flex-col space-y-2 sm:mt-0 sm:w-auto sm:flex-row sm:space-x-2 sm:space-y-0">
                    <Button variant="outline" type="button" onClick={() => setShowCookieSettingsModal(true)}>
                      {" "}
                      {t("cookies.settings")}{" "}
                    </Button>
                    <Button
                      disabled={isLoading}
                      // className={clsx(isLoading && "base-spinner")}
                      onClick={() => {
                        setCookies(allCookieCategories);
                        setIsOpen(false);
                      }}
                    >
                      {t("cookies.accept")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {showCookieSettingsModal && (
            <OpenModal onClose={() => setShowCookieSettingsModal(false)}>
              <CookieConsentSettings />
            </OpenModal>
          )}
        </div>
      )}
    </>
  );
}
