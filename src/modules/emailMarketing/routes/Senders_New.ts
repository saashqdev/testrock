import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export namespace Senders_New {
  export type LoaderData = {
    title: string;
  };
  export const loader = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
    await requireAuth();
    const { t } = await getServerTranslations();
    const data: LoaderData = {
      title: `${t("emailMarketing.senders.plural")} | ${process.env.APP_NAME}`,
    };
    return data;
  };

  export type ActionData = {
    error?: string;
  };
  const badRequest = (data: ActionData) => Response.json(data, { status: 400 });
  export const action = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
    await requireAuth();
    const { t } = await getServerTranslations();
    const tenantId = await getTenantIdOrNull({ request, params });

    const form = await request.formData();
    const action = form.get("action")?.toString() ?? "";
    if (action === "create") {
      try {
        const provider = form.get("provider")?.toString() ?? "";
        const stream = form.get("stream")?.toString() ?? "";
        const apiKey = form.get("apiKey")?.toString() ?? "";
        const fromEmail = form.get("fromEmail")?.toString() ?? "";
        const fromName = form.get("fromName")?.toString() ?? "";
        const replyToEmail = form.get("replyToEmail")?.toString() ?? "";

        await db.emailSenders.createEmailSender({
          tenantId,
          provider,
          stream,
          apiKey,
          fromEmail,
          fromName,
          replyToEmail,
        });
        return redirect(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
      } catch (e: any) {
        return badRequest({ error: e.message });
      }
    } else {
      return badRequest({ error: t("shared.invalidForm") });
    }
  };
}
