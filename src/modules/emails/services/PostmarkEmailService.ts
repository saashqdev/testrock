import * as postmark from "postmark";
import { getBaseURL } from "@/utils/url.server";
import { db } from "@/db";

export async function sendEmailPostmark({
  data,
  config,
}: {
  data: {
    to: string;
    subject?: string;
    body?: string;
    alias?: string;
    Attachments?: { Name: string; Content: string; ContentType: string; ContentID: string }[];
    data?: {
      [key: string]: any;
    };
  };
  config: {
    fromEmail: string;
    fromName: string;
    apiKey: string;
  };
}) {
  const client = new postmark.ServerClient(config.apiKey);
  if (data.alias) {
    const sent = await client.sendEmailWithTemplate({
      From: config.fromName ? `${config.fromName} <${config.fromEmail}>` : config.fromEmail,
      To: data.to,
      TemplateAlias: data.alias,
      TemplateModel: {
        ...(await getBaseTemplateModel()),
        ...data.data,
      },
      Attachments: data.Attachments || [],
    });
    return sent;
  } else {
    if (!data.subject) {
      throw new Error("Subject is required");
    }
    if (!data.body) {
      throw new Error("Body is required");
    }
    const sent = await client
      .sendEmail({
        From: config.fromEmail,
        To: data.to,
        Subject: data.subject,
        HtmlBody: data.body,
      })
      .catch((e) => {
        console.log("[Postmark] Error sending email", e.message);
        throw e;
      });
    return sent;
  }
}

async function getBaseTemplateModel() {
  const currentTenantUrl = getBaseURL();
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  return {
    product_url: currentTenantUrl,
    login_url: currentTenantUrl + "/login",
    product_name: appConfiguration.app.name,
    support_email: appConfiguration.email.supportEmail,
    sender_name: appConfiguration.email.fromName,
    company_name: appConfiguration.app.company?.name,
    company_address: appConfiguration.app.company?.address,
  };
}
