import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { EmailSenderWithoutApiKeyDto } from "@/db/models/email/EmailSenderModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  item: EmailSenderWithoutApiKeyDto;
};
export const loader = async (props: IServerComponentsProps) => {
  await requireAuth();
  const params = (await props.params) || {};
  const request = props.request!;
  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await db.emailSenders.getEmailSenderWithoutApiKey(params.id!, tenantId);
  if (!item) {
    return redirect(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
  }
  const data: LoaderData = {
    item,
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

  const existing = await db.emailSenders.getEmailSender(params.id ?? "", tenantId);
  if (!existing) {
    return badRequest({ error: t("shared.notFound") });
  }

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";

  if (action === "edit") {
    try {
      const provider = form.get("provider")?.toString() ?? "";
      const stream = form.get("stream")?.toString() ?? "";
      const fromEmail = form.get("fromEmail")?.toString() ?? "";
      const fromName = form.get("fromName")?.toString() ?? "";
      const replyToEmail = form.get("replyToEmail")?.toString() ?? "";

      await db.emailSenders.updateEmailSender(existing.id, {
        provider,
        stream,
        fromEmail,
        fromName,
        replyToEmail,
      });
      return redirect(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else if (action === "delete") {
    await db.emailSenders.deleteEmailSender(existing.id);
    return redirect(params.tenant ? `/app/${params.tenant}/email-marketing/senders` : "/admin/email-marketing/senders");
  }
  return badRequest({ error: t("shared.invalidForm") });
};
