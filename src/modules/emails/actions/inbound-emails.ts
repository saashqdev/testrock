import { EmailWithSimpleDetailsDto } from "@/db/models/email/EmailsModel";
import { getServerTranslations } from "@/i18n/server";
import { getPostmarkInboundMessages, getPostmarkInboundMessage } from "@/lib/emails/postmark.server";
import { getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type ActionDataEmails = {
  error?: string;
  items?: EmailWithSimpleDetailsDto[];
};
const badRequest = (data: ActionDataEmails) => Response.json(data, { status: 400 });
export const actionInboundEmails = async (props: IServerComponentsProps, tenantId: string | null) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const { t } = await getServerTranslations();
  const form = await request.formData();

  const action = form.get("action");
  if (action === "sync") {
    const allEmails = await getPostmarkInboundMessages();
    await Promise.all(
      allEmails.map(async (newEmail) => {
        const messageId = newEmail.MessageID.toString();
        const existing = await db.emails.getEmailByMessageId(messageId);
        if (existing) {
          return;
        }
        const email = await getPostmarkInboundMessage(messageId);
        if (!email) {
          return;
        }

        await db.emails.createEmail({
          tenantInboundAddressId: null,
          messageId: email.MessageID,
          type: "inbound",
          date: new Date(email.Date),
          subject: email.Subject,
          fromEmail: email.From,
          fromName: email.FromName,
          toEmail: email.ToFull[0].Email,
          toName: email.ToFull[0].Name,
          textBody: email.TextBody,
          htmlBody: email.HtmlBody,
          cc: { create: email.CcFull.map((cc: any) => ({ toEmail: cc.Email, toName: cc.Name })) },
          // attachments:
          //   attachmentsWithContent.length > 0
          //     ? {
          //         create: attachmentsWithContent.map((attachment: any) => ({
          //           name: attachment.Name,
          //           content: attachment.Content,
          //           type: attachment.ContentType,
          //           length: attachment.ContentLength,
          //         })),
          //       }
          //     : undefined,
        });
      })
    );

    const urlSearchParams = new URL(request.url).searchParams;
    const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
    const items = await db.emails.getAllEmails("inbound", currentPagination, undefined, tenantId);
    return Response.json({
      items,
    });
  } else {
    return badRequest({ error: t("shared.invalidForm") });
  }
};
