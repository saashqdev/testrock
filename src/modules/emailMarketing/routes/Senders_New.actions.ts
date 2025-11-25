"use server";

import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";

// Server Action for the Next.js form handling
export const createEmailSenderAction = async (prev: any, formData: FormData) => {
  try {
    await requireAuth();

    const action = formData.get("action")?.toString() ?? "";
    const tenant = formData.get("tenant")?.toString();

    if (action === "create") {
      const provider = formData.get("provider")?.toString() ?? "";
      const stream = formData.get("stream")?.toString() ?? "";
      const apiKey = formData.get("apiKey")?.toString() ?? "";
      const fromEmail = formData.get("fromEmail")?.toString() ?? "";
      const fromName = formData.get("fromName")?.toString() ?? "";
      const replyToEmail = formData.get("replyToEmail")?.toString() ?? "";

      // Get tenantId from tenant slug if provided
      let tenantId: string | null = null;
      if (tenant) {
        const tenantData = await db.tenants.getTenantByIdOrSlug(tenant);
        if (tenantData) {
          tenantId = tenantData.id;
        }
      }

      await db.emailSenders.createEmailSender({
        tenantId,
        provider,
        stream,
        apiKey,
        fromEmail,
        fromName,
        replyToEmail,
      });

      return { success: "Email sender created successfully", redirect: true, redirectUrl: tenant ? `/app/${tenant}/email-marketing/senders` : "/admin/email-marketing/senders" };
    }

    return { error: "Invalid action" };
  } catch (e: any) {
    return { error: e.message };
  }
};
