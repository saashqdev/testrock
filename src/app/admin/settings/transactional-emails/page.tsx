import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import EmailTemplates from "@/modules/emails/utils/EmailTemplates";
import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import Component from "./component";

type LoaderData = {
  title: string;
  items: { id: string; name: string; description: string }[];
  appConfiguration: AppConfigurationDto;
  providers: {
    name: string;
    value: string;
    error: string | null;
  }[];
};

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("settings.admin.transactionalEmails.title")} | ${defaultSiteTags.title}`,
  });
}

export default async function TransactionalEmailsPage() {
  await requireAuth();
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  await verifyUserHasPermission("admin.emails.view");
  // Extract only serializable properties (exclude functions)
  const items = EmailTemplates.allTemplates.map(({ name, description }) => ({ id: name, name, description }));
  const { t } = await getServerTranslations();

  const providers = [
    {
      name: "Postmark",
      value: "postmark",
      error: process.env.POSTMARK_SERVER_TOKEN ? null : "POSTMARK_SERVER_TOKEN is not set",
    },
    {
      name: "Resend",
      value: "resend",
      error: process.env.RESEND_API_KEY ? null : "RESEND_API_KEY is not set",
    },
    {
      name: "SendGrid",
      value: "sendgrid",
      error: process.env.SENDGRID_API_KEY ? null : "SENDGRID_API_KEY is not set",
    },
  ];

  // Serialize appConfiguration by removing non-serializable functions
  const serializedAppConfiguration: AppConfigurationDto = {
    ...appConfiguration,
    portals: {
      ...appConfiguration.portals,
      pages: appConfiguration.portals.pages,
    },
  };

  const data: LoaderData = {
    title: `${t("settings.admin.transactionalEmails.title")} | ${defaultSiteTags.title}`,
    items,
    appConfiguration: serializedAppConfiguration,
    providers,
  };

  return <Component initialData={data} />;
}
