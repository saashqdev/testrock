"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import OpenSuccessModal from "@/components/ui/modals/OpenSuccessModal";
import OpenErrorModal from "@/components/ui/modals/OpenErrorModal";
import PageBlocks from "@/modules/pageBlocks/components/blocks/PageBlocks";
import { useRootData } from "@/lib/state/useRootData";
import RecaptchaWrapper from "@/components/recaptcha/RecaptchaWrapper";
import HoneypotInput from "@/components/ui/honeypot/HoneypotInput";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import InputText from "@/components/ui/input/InputText";
import { LoaderData } from "./Newsletter.server";
import { handleNewsletterAction } from "./actions";

interface NewsletterClientProps {
  data: Omit<LoaderData, "t">;
}

export default function NewsletterClient({ data }: NewsletterClientProps) {
  const { t } = useTranslation();
  const { csrf } = useRootData();
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [actionResult, setActionResult] = useState<{ error?: string; success?: string }>();
  
  const isSubscribing = isPending;
  const state: "idle" | "success" | "error" | "submitting" =
    isPending ? "submitting" : actionResult?.success ? "success" : actionResult?.error ? "error" : "idle";

  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await handleNewsletterAction(formData);
      setActionResult(result);
      
      if (result?.success && formRef.current) {
        formRef.current.reset();
        setEmail("");
      }
    });
  };

  return (
    <div>
      <div>
        <HeaderBlock />
        <PageBlocks items={data.blocks} />
        <div className="bg-background">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="sm:align-center sm:flex sm:flex-col">
              <div className="relative mx-auto w-full max-w-2xl overflow-hidden px-2 py-12 sm:py-6">
                <div className="text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("front.newsletter.title")}</h1>
                  <p className="text-muted-foreground mt-4 text-lg leading-6">{t("front.newsletter.headline")}</p>
                </div>
                <div className="mx-auto mt-12 max-w-xl">
                  {data.settings.error ? (
                    <WarningBanner title={t("shared.error")} text={data.settings.error} />
                  ) : (
                    <div>
                      <RecaptchaWrapper enabled>
                        <form
                          ref={formRef}
                          action={handleSubmit}
                          aria-hidden={state === "success"}
                          className="mt-9 grid grid-cols-1 gap-x-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4"
                        >
                          <input type="hidden" name="csrf" value={csrf} hidden readOnly />
                          <HoneypotInput />
                          <input name="action" type="hidden" value="subscribe" readOnly hidden />
                          <input name="source" type="hidden" value="newsletter" readOnly hidden />
                          <div>
                            <InputText
                              title={t("front.contact.firstName")}
                              required
                              type="text"
                              name="first_name"
                              id="first_name"
                              autoComplete="given-name"
                              // className="focus:border-theme-300 focus:ring-theme-300 relative block w-full appearance-none rounded-md border-border bg-secondary px-3 py-2 text-foreground placeholder-gray-500 focus:z-10 focus:outline-hidden dark:border-gray-600 dark:bg-gray-900 dark:text-slate-200 sm:text-sm"
                              defaultValue=""
                            />
                          </div>
                          <div>
                            <InputText
                              title={t("front.contact.lastName")}
                              type="text"
                              name="last_name"
                              id="last_name"
                              autoComplete="family-name"
                              defaultValue=""
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <div className="mt-1">
                              <InputText
                                title={t("front.contact.email")}
                                required
                                aria-label="Email address"
                                aria-describedby="error-message"
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                setValue={setEmail}
                              />
                            </div>
                          </div>

                          <div className="flex items-baseline justify-between space-x-2 sm:col-span-2">
                            <div>
                              {state === "success" ? (
                                <div>
                                  <p>{t("front.newsletter.checkEmail")}</p>
                                </div>
                              ) : state === "error" ? (
                                <p>{actionResult?.error}</p>
                              ) : (
                                <div></div>
                              )}
                            </div>
                            <ButtonPrimary
                              event={{ action: "click", category: "newsletter", label: "subscribe", value: email }}
                              type="submit"
                              disabled={isSubscribing || !email}
                            >
                              {isSubscribing ? t("front.newsletter.subscribing") + "..." : t("front.newsletter.subscribe")}
                            </ButtonPrimary>
                          </div>
                        </form>
                      </RecaptchaWrapper>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <FooterBlock />
      </div>

      <OpenSuccessModal
        title={t("front.newsletter.subscribed")}
        description={actionResult?.success?.toString() ?? ""}
        open={!!actionResult?.success}
        onClose={() => setActionResult(undefined)}
      />

      <OpenErrorModal
        title={t("shared.error")}
        description={actionResult?.error?.toString() ?? ""}
        open={!!actionResult?.error}
        onClose={() => setActionResult(undefined)}
      />
    </div>
  );
}
