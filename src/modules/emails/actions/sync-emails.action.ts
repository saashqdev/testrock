"use server";

import { revalidatePath } from "next/cache";
import { EmailWithSimpleDetailsDto } from "@/db/models/email/EmailsModel";
import { getServerTranslations } from "@/i18n/server";
import { getPostmarkInboundMessages, getPostmarkInboundMessage } from "@/lib/emails/postmark.server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";

export type SyncEmailsResult = {
  success?: boolean;
  error?: string;
  items?: EmailWithSimpleDetailsDto[];
};

export async function syncEmailsAction(tenantId: string | null, currentPath: string): Promise<SyncEmailsResult> {
  try {
    await requireAuth();
    const { t } = await getServerTranslations();

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
        });
      })
    );

    // Revalidate the current path to refresh the data
    revalidatePath(currentPath);

    const items = await db.emails.getAllEmails("inbound", { page: 1, pageSize: 10 }, undefined, tenantId);

    return {
      success: true,
      items: items.items,
    };
  } catch (error: any) {
    console.error("Error syncing emails:", error);
    return {
      error: error.message || "Failed to sync emails",
    };
  }
}
