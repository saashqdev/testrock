"use client";

import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import TableSimple from "@/components/ui/tables/TableSimple";
import { useAdminData } from "@/lib/state/useAdminData";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import InputSelect from "@/components/ui/input/InputSelect";
import ModalOrSlide from "@/components/ui/modals/ModalOrSlide";
import { GearIcon } from "@radix-ui/react-icons";
import BackButtonWithTitle from "@/components/ui/buttons/BackButtonWithTitle";
import { handleEmailAction, handleUpdateAppConfiguration } from "./actions";

type LoaderData = {
  title: string;
  items: { id: string; name: string; description: string }[];
  appConfiguration: AppConfigurationDto;
  providers: {
    name: string;
    value: string;
    error: string | null;
  }[];
};

interface TransactionalEmailsClientProps {
  initialData: LoaderData;
}

export default function TransactionalEmailsClient({ initialData }: TransactionalEmailsClientProps) {
  const adminData = useAdminData();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [settingApiKey, setSettingApiKey] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [emailProvider, setEmailProvider] = useState(initialData.appConfiguration.email.provider);

  async function sendTest(templateName: string): Promise<void> {
    let to = adminData?.user?.email;
    if (to === "admin@email.com") {
      to = initialData.appConfiguration.email.supportEmail;
    }
    const email = window.prompt("Email", to);
    if (!email || email.trim() === "") {
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("action", "send-test");
    formData.set("template", templateName);
    formData.set("email", email);

    startTransition(async () => {
      const result = await handleEmailAction(formData);
      setIsSubmitting(false);
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  async function createPostmarkEmailTemplates() {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("action", "create-postmark-email-templates");

    startTransition(async () => {
      const result = await handleEmailAction(formData);
      setIsSubmitting(false);
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  async function handleSubmitSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await handleUpdateAppConfiguration(formData);
      setIsSubmitting(false);
      if (result.success) {
        toast.success(result.success);
        setOpenSettings(false);
        setSettingApiKey(false);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  }

  function getProviderEnvName() {
    switch (emailProvider) {
      case "postmark":
        return "POSTMARK_SERVER_TOKEN";
      case "resend":
        return "RESEND_API_KEY";
      case "sendgrid":
        return "SENDGRID_API_KEY";
      default:
        return "";
    }
  }
  return (
    <EditPageLayout
      title={
        <div className="flex w-full items-center justify-between gap-4">
          <BackButtonWithTitle href="/admin/settings">
            <div className="flex items-center gap-2">
              <div>{t("settings.admin.transactionalEmails.title")}</div>
              {initialData.appConfiguration.email.provider ? (
                <Badge variant="secondary" className="border border-blue-300 bg-blue-50 text-blue-800">
                  {initialData.appConfiguration.email.provider}
                </Badge>
              ) : (
                <Badge variant="destructive">No provider configured</Badge>
              )}
            </div>
          </BackButtonWithTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setOpenSettings(true)}>
              <GearIcon className="h-4 w-4" />
            </Button>
            {initialData.appConfiguration.email.provider === "postmark" && (
              <ButtonPrimary disabled={isSubmitting || isPending} type="button" onClick={createPostmarkEmailTemplates}>
                Create Postmark templates
              </ButtonPrimary>
            )}
          </div>
        </div>
      }
    >
      <TableSimple
        items={initialData.items}
        headers={[
          {
            name: "name",
            title: "admin.emails.name",
            value: (i) => i.name,
          },
          {
            name: "description",
            title: "shared.description",
            value: (i) => i.description,
          },
        ]}
        actions={[
          {
            title: t("admin.emails.sendTest"),
            onClick: (_, item) => sendTest(item.name),
            disabled: () => isSubmitting || isPending,
          },
        ]}
      />

      <ModalOrSlide
        type="slide"
        title="Email Settings"
        open={openSettings}
        setOpen={() => {
          setOpenSettings(false);
          setSettingApiKey(false);
        }}
        size="lg"
      >
        <form onSubmit={handleSubmitSettings}>
          <div className="grid gap-2 sm:grid-cols-12">
            <div className="sm:col-span-12">
              <Label className="mb-1 block text-xs">Provider</Label>
              <InputSelect
                name="emailProvider"
                value={emailProvider}
                onChange={(e) => setEmailProvider(e as any)}
                options={initialData.providers.map((p) => ({
                  value: p.value,
                  name: `${p.name}`,
                }))}
              />
            </div>

            <div className="sm:col-span-6">
              <Label className="mb-1 block text-xs">
                From email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                name="emailFromEmail"
                defaultValue={initialData.appConfiguration.email.fromEmail}
                placeholder=""
                className="bg-background"
                required
              />
            </div>
            <div className="sm:col-span-6">
              <Label className="mb-1 block text-xs">From name</Label>
              <Input
                autoComplete="name"
                name="emailFromName"
                defaultValue={initialData.appConfiguration.email.fromName}
                placeholder=""
                className="bg-background"
              />
            </div>
            <div className="sm:col-span-12">
              <Label className="mb-1 block text-xs">Support email</Label>
              <Input
                type="email"
                name="emailSupportEmail"
                defaultValue={initialData.appConfiguration.email.supportEmail}
                placeholder=""
                className="bg-background"
              />
            </div>

            {settingApiKey && (
              <div className="sm:col-span-12">
                <Label className="mb-1 block text-xs">API Key</Label>
                <Input
                  name="apiKey"
                  placeholder={"Leave blank to use env variable: " + getProviderEnvName()}
                  className="bg-background"
                  style={{ WebkitTextSecurity: "disc" } as any}
                  autoFocus
                />
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between">
            <div>
              <Button type="button" size="sm" variant="ghost" onClick={() => setSettingApiKey(!settingApiKey)} className="w-full">
                <div className="flex justify-start text-left">Change API Key</div>
              </Button>
            </div>
            <Button variant="outline" type="submit" disabled={isSubmitting || isPending} className={cn((isSubmitting || isPending) && "base-spinner")}>
              {t("shared.save")}
            </Button>
          </div>
        </form>
      </ModalOrSlide>
    </EditPageLayout>
  );
}
