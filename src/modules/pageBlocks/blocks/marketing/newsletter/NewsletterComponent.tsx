"use client";

import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import SuccessBanner from "@/components/ui/banners/SuccessBanner";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import HoneypotInput from "@/components/ui/honeypot/HoneypotInput";
import { Input } from "@/components/ui/input";
import useRootData from "@/lib/state/useRootData";
import { actionSubscribe } from "@/modules/pageBlocks/pages/NewsletterPage";
import { useActionState, useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function NewsletterComponent() {
  const { t } = useTranslation();
  const { csrf } = useRootData();
  // const data = useTypedLoaderData<NewsletterPage.LoaderData>();
  const [actionData, action, pending] = useActionState(actionSubscribe, null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && actionData?.success) {
      formRef.current?.reset();
    }
  }, [actionData?.success, pending]);

  const [actionResult, setActionResult] = useState<{ error?: string; success?: string } | null>(null);

  useEffect(() => {
    setActionResult(actionData);
  }, [actionData]);

  return (
    <div className="mx-auto max-w-xl">
      <form
              action={action}
              ref={formRef}
              aria-hidden={actionData?.success ? true : false}
              className="mt-9 grid grid-cols-1 gap-x-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4"
            >
              <input type="hidden" name="csrf" value={csrf} hidden readOnly />
              <HoneypotInput />
              <input name="action" type="hidden" value="subscribe_to_newsletter" readOnly hidden />
              <input name="source" type="hidden" value="newsletter" readOnly hidden />
              <div>
                <label htmlFor="email" className="mb-1 text-xs font-medium">
                  {t("front.newsletter.email")} <span className="text-red-500">*</span>
                </label>
                <Input title={t("front.contact.firstName")} required type="text" name="first_name" id="first_name" autoComplete="given-name" defaultValue="" />
              </div>
              <div>
                <label htmlFor="last_name" className="mb-1 text-xs font-medium">
                  {t("front.contact.lastName")} <span className="text-red-500">*</span>
                </label>
                <Input title={t("front.contact.lastName")} type="text" name="last_name" id="last_name" autoComplete="family-name" defaultValue="" />
              </div>
              <div className="sm:col-span-2">
                <div className="mt-1">
                  <label htmlFor="email" className="mb-1 text-xs font-medium">
                    {t("front.contact.email")} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    title={t("front.contact.email")}
                    required
                    aria-label="Email address"
                    aria-describedby="error-message"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue=""
                  />
                </div>
              </div>

              <div className="flex items-baseline justify-between space-x-2 sm:col-span-2">
                <div></div>
                <LoadingButton isLoading={pending} type="submit">
                  {pending ? t("front.newsletter.subscribing") + "..." : t("front.newsletter.subscribe")}
                </LoadingButton>
              </div>
      </form>
      <div className="mt-2">
        {actionResult?.success && <SuccessBanner title={t("front.newsletter.subscribed")} text={actionResult.success} />}
        {actionResult?.error && <ErrorBanner title={t("shared.error")} text={actionResult.error} />}
      </div>
    </div>
  );
}
