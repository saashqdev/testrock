"use server";

import { sendEmailPostmark } from "./PostmarkEmailService";
import { sendEmailResend } from "./ResendEmailService";
import { sendEmailSendGrid } from "./SendGridEmailService";
import { prisma } from "@/db/config/prisma/database";
import invariant from "tiny-invariant";
import { db } from "@/db";

export async function sendEmail({
  to,
  subject,
  body,
  alias,
  data,
  manualConfig,
}: {
  to: string;
  subject: string;
  body: string;
  alias?: string;
  data?: {
    [key: string]: any;
  };
  manualConfig?: {
    provider: "postmark" | "resend" | "sendgrid";
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
}) {
  const config = manualConfig ?? (await getEmailConfig());
  if (!config) {
    // eslint-disable-next-line no-console
    throw new Error("📧 Email provider not configured");
  }
  // eslint-disable-next-line no-console
  console.log("📧 Sending email", { providerSettings: config.provider, to, subject, data });
  switch (config.provider) {
    case "postmark":
      return await sendEmailPostmark({ data: { to, subject, body, alias, data }, config });
    case "resend":
      invariant(subject, "Subject is required");
      invariant(body, "Body is required");
      return await sendEmailResend({ data: { to, subject, body }, config });
    case "sendgrid":
      invariant(subject, "Subject is required");
      invariant(body, "Body is required");
      return await sendEmailSendGrid({ data: { to, subject, body }, config });
    default:
      throw new Error("Invalid provider: " + config.provider);
  }
}

export async function getEmailProvider() {
  const clientConfig = await getEmailConfig();
  return clientConfig?.provider;
}

export async function getEmailConfig() {
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  const apiKeyCredential = await prisma.credential.findUnique({
    where: {
      name: appConfiguration.email.provider,
    },
  });
  let provider = appConfiguration.email.provider;
  let apiKey = apiKeyCredential?.value?.toString();
  if (provider === "postmark") {
    if (!apiKey) {
      apiKey = process.env.POSTMARK_SERVER_TOKEN;
    }
    if (!apiKey) {
      // eslint-disable-next-line no-console
      console.error("📧 POSTMARK_SERVER_TOKEN required");
      return null;
    }
    return {
      apiKey,
      ...appConfiguration.email,
    };
  } else if (provider === "resend") {
    if (!apiKey) {
      apiKey = process.env.RESEND_API_KEY;
    }
    if (!apiKey) {
      // eslint-disable-next-line no-console
      console.error("📧 RESEND_API_KEY required");
      return null;
    }
    return {
      apiKey,
      ...appConfiguration.email,
    };
  } else if (provider === "sendgrid") {
    if (!apiKey) {
      apiKey = process.env.SENDGRID_API_KEY;
    }
    if (!apiKey) {
      // eslint-disable-next-line no-console
      console.error("📧 SENDGRID_API_KEY required");
      return null;
    }
    return {
      apiKey,
      ...appConfiguration.email,
    };
  }
  console.error("📧 POSTMARK_SERVER_TOKEN, RESEND_API_KEY or SENDGRID_API_KEY required");
  return null;
}
