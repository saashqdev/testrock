"use server";

import { revalidatePath } from "next/cache";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { createPostmarkEmailTemplates, deleteEmailTemplate } from "@/utils/services/emailService";
import EmailTemplates from "@/modules/emails/utils/EmailTemplates";
import { sendEmail } from "@/modules/emails/services/EmailService";
import { requireUser } from "@/lib/services/session.server";
import { prisma } from "@/db/config/prisma/database";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";

type ActionResult = {
  error?: string;
  success?: string;
};

export async function handleEmailAction(formData: FormData): Promise<ActionResult> {
  try {
    await requireAuth();
    await verifyUserHasPermission("admin.emails.update");
    const { t } = await getServerTranslations();

    const action = formData.get("action")?.toString();

    if (action === "create-postmark-email-templates") {
      await verifyUserHasPermission("admin.emails.create");
      try {
        await createPostmarkEmailTemplates();
        revalidatePath("/admin/settings/transactional-emails");
        return { success: "All templates created" };
      } catch (e: any) {
        return { error: e?.toString() };
      }
    } else if (action === "create-email-template") {
      await verifyUserHasPermission("admin.emails.create");
      try {
        const alias = formData.get("alias")?.toString();
        if (!alias) {
          return { error: `Alias ${alias} not found` };
        }

        await createPostmarkEmailTemplates(alias);

        revalidatePath("/admin/settings/transactional-emails");
        return { success: "Template created" };
      } catch (e: any) {
        return { error: e?.toString() };
      }
    } else if (action === "delete-postmark-email") {
      await verifyUserHasPermission("admin.emails.delete");
      try {
        const alias = formData.get("alias")?.toString();
        if (!alias) {
          return { error: `Alias ${alias} not found` };
        }
        await deleteEmailTemplate(alias);

        revalidatePath("/admin/settings/transactional-emails");
        return { success: "Template deleted" };
      } catch (e: any) {
        return { error: e?.toString() };
      }
    } else if (action === "send-test") {
      const email = formData.get("email")?.toString();
      const templateName = formData.get("template")?.toString();
      if (!email) {
        return { error: "Invalid email" };
      }
      const template = EmailTemplates.allTemplates.find((f) => f.name === templateName);
      if (!template) {
        return { error: "Invalid template" };
      }

      const appConfiguration = await db.appConfiguration.getAppConfiguration();
      const user = await requireUser({} as any);

      try {
        await sendEmail({
          to: email,
          alias: template.name,
          ...template.parse({
            appConfiguration,
            data: {
              name: user?.firstName,
              invite_sender_name: user?.firstName,
              invite_sender_organization: "{Account Name}",
            },
          }),
        });
        return { success: "Test email sent" };
      } catch (e: any) {
        return { error: e?.toString() };
      }
    }

    return { error: t("shared.invalidForm") };
  } catch (error: any) {
    return { error: error?.message || "An error occurred" };
  }
}

export async function handleUpdateAppConfiguration(formData: FormData): Promise<ActionResult> {
  try {
    await requireAuth();
    await verifyUserHasPermission("admin.emails.update");
    const { t } = await getServerTranslations();

    const data = {
      emailProvider: formData.get("emailProvider")?.toString(),
      emailFromEmail: formData.get("emailFromEmail")?.toString(),
      emailFromName: formData.get("emailFromName")?.toString(),
      emailSupportEmail: formData.get("emailSupportEmail")?.toString(),
    };

    await db.appConfiguration.updateAppConfiguration(data);

    const apiKey = formData.get("apiKey")?.toString();
    if (data.emailProvider && apiKey !== undefined && apiKey !== "") {
      await prisma.credential.upsert({
        where: { name: data.emailProvider },
        update: { value: apiKey },
        create: { name: data.emailProvider, value: apiKey },
      });
    }

    revalidatePath("/admin/settings/transactional-emails");
    return { success: t("shared.updated") };
  } catch (error: any) {
    return { error: error?.message || "An error occurred" };
  }
}
