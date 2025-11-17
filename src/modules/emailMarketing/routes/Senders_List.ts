import { getServerTranslations } from "@/i18n/server";
import { sendBroadcast } from "@/lib/emails/postmark.server";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { EmailSenderWithoutApiKeyDto } from "@/db/models/email/EmailSenderModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
export type LoaderData = {
  items: EmailSenderWithoutApiKeyDto[];
  hasSetWebhooks: boolean;
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const items = await db.emailSenders.getAllEmailSenders(tenantId);
  const deliveredEmails = await db.outboundEmails.findOutboundEmails(tenantId, {
    where: {
      deliveredAt: { not: null },
    },
  });
  const data: LoaderData = {
    items,
    hasSetWebhooks: deliveredEmails.length > 0,
  };
  return data;
};

export type ActionData = {
  error?: string;
  success?: string;
};
export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdOrNull({ request, params });
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const email = form.get("email")?.toString() ?? "";
  const senderId = form.get("senderId")?.toString() ?? "";
  if (action === "send-test") {
    const sender = await db.emailSenders.getEmailSender(senderId, tenantId);
    if (!sender) {
      return Response.json({ error: "Invalid sender" }, { status: 400 });
    }
    const outboundEmail = await db.outboundEmails.createOutboundEmailTest({
      tenantId,
      email,
      fromSenderId: senderId,
    });
    try {
      await sendBroadcast({
        sender,
        to: email,
        subject: "Test email",
        htmlBody: `This is a test email with a link: 
Link: <a href='https://www.google.com'>Google</a> <br/>
Custom unsubscribe link: <a href="{{{ pm:unsubscribe }}}">Unsubscribe from this list</a> </br>
`,
        textBody: `This is a test email with a link: https://www.therock.com.
`,
        track: true,
        metadata: {
          outboundEmailId: outboundEmail.id,
        },
      });
      await db.outboundEmails.updateOutboundEmail(outboundEmail.id, {
        sentAt: new Date(),
      });
      return Response.json({ success: t("shared.sent") }, { status: 200 });
    } catch (e: any) {
      await db.outboundEmails.updateOutboundEmail(outboundEmail.id, {
        error: e.message,
      });
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else {
    return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

