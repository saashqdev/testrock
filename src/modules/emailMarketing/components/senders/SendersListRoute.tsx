"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import TableSimple from "@/components/ui/tables/TableSimple";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { EmailSenderWithoutApiKeyDto } from "@/db/models/email/EmailSenderModel";
import { LoaderData } from "../../routes/Senders_List";
import toast from "react-hot-toast";
import { useRootData } from "@/lib/state/useRootData";

export default function SendersListRoute() {
  const { appConfiguration } = useRootData();
  const [data, setData] = useState<LoaderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const queryString = searchParams.toString();
        const url = `/api/email-marketing/senders${queryString ? `?${queryString}` : ""}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch senders data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  async function sendTest(item: EmailSenderWithoutApiKeyDto) {
    const email = window.prompt("Email", appOrAdminData?.user?.email);
    if (!email || email.trim() === "") {
      return;
    }

    try {
      const form = new FormData();
      form.set("action", "send-test");
      form.set("senderId", item.id);
      form.set("email", email);

      const queryString = searchParams.toString();
      const url = `/api/email-marketing/senders${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        method: "POST",
        body: form,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.success);
      } else {
        toast.error(result.error || "Failed to send test email");
      }
    } catch (err) {
      toast.error("Failed to send test email");
    }
  }
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
        <div className="flex items-center justify-center py-8">
          <div className="text-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
        <div className="flex items-center justify-center py-8">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
        <div className="flex items-center justify-center py-8">
          <div className="text-foreground">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
        <div className="md:border-b md:border-border md:py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-foreground">{t("emailMarketing.senders.plural")}</h3>
            <div className="flex items-center space-x-2">
              <ButtonPrimary to="senders/new">{t("shared.new")}</ButtonPrimary>
            </div>
          </div>
        </div>

        {data.items.length === 0 ? (
          <InfoBanner title={t("shared.note")} text="">
            Go to your{" "}
            <a className="underline" target="_blank" rel="noreferrer" href="https://account.postmarkapp.com/servers">
              Postmark server
            </a>
            , click on the &quot;API Tokens&quot; tab, and copy the API token.
          </InfoBanner>
        ) : !data.hasSetWebhooks ? (
          <WarningBanner title={t("shared.warning")} text="">
            Go to your{" "}
            <a className="underline" target="_blank" rel="noreferrer" href="https://account.postmarkapp.com/servers">
              Postmark server
            </a>
            , click on the Message stream <i>(e.g. Default Broadcast Stream)</i>, then on the &quot;<b>Webhooks</b>&quot; tab, click &quot;<b>Add webhook</b>
            &quot;, set the URL to &quot;<b className="select-all">{appConfiguration.app.url}/webhooks/email/postmark</b>&quot;, and select every event you want
            to track <i>(Deliveries, Bounces, Opens, Link Clicks, Unsubscribes...)</i>.
            <p className="mt-2">
              Finally, before clicking &quot;<b>Save webhook</b>&quot;, click on the &quot;<b>Send test</b>&quot; button to make sure it works.
            </p>
          </WarningBanner>
        ) : null}

        <TableSimple
          headers={[
            {
              name: "provider",
              title: t("emailMarketing.senders.provider"),
              value: (item) => item.provider,
            },
            {
              name: "stream",
              title: t("emailMarketing.senders.stream"),
              value: (item) => item.stream,
            },
            {
              name: "fromEmail",
              title: t("emailMarketing.senders.fromEmail"),
              value: (item) => item.fromEmail,
            },
            {
              name: "fromName",
              title: t("emailMarketing.senders.fromName"),
              value: (item) => item.fromName,
            },
            {
              name: "replyToEmail",
              title: t("emailMarketing.senders.replyToEmail"),
              value: (item) => item.replyToEmail,
            },
          ]}
          items={data.items}
          actions={[
            {
              title: t("admin.emails.sendTest"),
              onClick: (_, item) => sendTest(item),
            },
            {
              title: t("shared.edit"),
              onClickRoute: (_, item) => item.id,
            },
          ]}
        ></TableSimple>
      </div>
    </>
  );
}
