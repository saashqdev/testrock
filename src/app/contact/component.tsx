"use client";

import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import { useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import OpenSuccessModal from "@/components/ui/modals/OpenSuccessModal";
import OpenErrorModal from "@/components/ui/modals/OpenErrorModal";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import PageBlocks from "@/modules/pageBlocks/components/blocks/PageBlocks";
import HoneypotInput from "@/components/ui/honeypot/HoneypotInput";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import InputText from "@/components/ui/input/InputText";
import InputSelect from "@/components/ui/input/InputSelect";
import { LoaderData } from "./Contact.server";
import { handleContactAction } from "./actions";

interface ContactClientProps {
  data: Omit<LoaderData, "t">;
}

export default function ContactClient({ data }: ContactClientProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [actionResult, setActionResult] = useState<{ error?: string; success?: string }>();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await handleContactAction(formData);
      setActionResult(result);

      if (result?.success && formRef.current) {
        formRef.current.reset();
      }
    });
  };

  return (
    <div>
      <div>
        <HeaderBlock />
        <PageBlocks items={data.blocks} />
        <div className="bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="sm:align-center sm:flex sm:flex-col">
              <div className="relative mx-auto w-full max-w-xl overflow-hidden px-2 py-12 sm:py-6">
                <div className="text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("front.contact.title")}</h1>
                  <p className="mt-4 text-lg leading-6 text-muted-foreground">{t("front.contact.headline")}</p>
                </div>
                <div className="mt-12">
                  {data.settings.error ? (
                    <WarningBanner title={t("shared.error")} text={data.settings.error} />
                  ) : data.settings.actionUrl ? (
                    <form ref={formRef} action={data.settings.actionUrl} method="POST">
                      <HoneypotInput name="_gotcha" />
                      <ContactForm isPending={isPending} />
                    </form>
                  ) : data.settings.crm ? (
                    <form ref={formRef} action={handleSubmit}>
                      <input type="hidden" name="action" value="submission" hidden readOnly />
                      <HoneypotInput name="codeId" />
                      <ContactForm isPending={isPending} />
                    </form>
                  ) : null}
                  <div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FooterBlock />
      </div>

      <OpenSuccessModal
        title={t("shared.success")}
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

function ContactForm({ isPending }: { isPending: boolean }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="mt-9 grid grid-cols-1 gap-x-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
      <div>
        <div className="mt-1">
          <InputText title={t("front.contact.firstName")} required type="text" name="first_name" id="first_name" autoComplete="given-name" defaultValue="" />
        </div>
      </div>
      <div>
        <div className="mt-1">
          <InputText title={t("front.contact.lastName")} type="text" name="last_name" id="last_name" autoComplete="family-name" defaultValue="" />
        </div>
      </div>
      <div className="sm:col-span-2">
        <div className="mt-1">
          <InputText title={t("front.contact.email")} required id="email" name="email" type="email" autoComplete="email" value={email} setValue={setEmail} />
        </div>
      </div>

      <div>
        <div className="mt-1">
          <InputText title={t("front.contact.organization")} type="text" name="company" id="company" autoComplete="organization" defaultValue="" />
        </div>
      </div>

      <div>
        <div className="mt-1">
          <InputText
            title={t("front.contact.jobTitle")}
            type="text"
            name="jobTitle"
            id="organization-title"
            autoComplete="organization-title"
            defaultValue=""
          />
        </div>
      </div>

      <fieldset className="sm:col-span-2">
        <legend className="block text-sm font-medium text-foreground dark:text-slate-500">{t("front.contact.users")}</legend>
        <div className="mt-4 grid grid-cols-1 gap-y-4">
          <InputSelect
            name="users"
            required
            options={["1", "2 - 3", "4 - 10", "11 - 25", "26 - 50", "51 - 100", "+100"].map((option) => ({
              name: option,
              value: option,
            }))}
            defaultValue="1"
          />
        </div>
      </fieldset>

      <div className="sm:col-span-2">
        <div className="mt-1">
          <InputText title={t("front.contact.comments")} required id="comments" name="comments" rows={4} value={message} setValue={setMessage} />
        </div>
      </div>

      <div className="text-right sm:col-span-2">
        <ButtonPrimary
          event={{ action: "click", category: "contact", label: t("front.contact.send"), value: email + ": " + message }}
          type="submit"
          disabled={!email || !message || isPending}
        >
          {isPending ? t("shared.loading") + "..." : t("front.contact.send")}
        </ButtonPrimary>
      </div>
    </div>
  );
}
