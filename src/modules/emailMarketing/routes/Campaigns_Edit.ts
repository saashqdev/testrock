import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { CampaignWithDetailsDto } from "@/db/models/email/CampaignsModel";
import { EmailSenderWithoutApiKeyDto } from "@/db/models/email/EmailSenderModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import EmailMarketingService from "../services/EmailMarketingService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export type LoaderData = {
  title: string;
  item: CampaignWithDetailsDto;
  emailSenders: EmailSenderWithoutApiKeyDto[];
  allEntities: EntityWithDetailsDto[];
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await db.campaigns.getCampaign(params.id!, tenantId);
  if (!item) {
    return redirect(params.tenant ? `/app/${params.tenant}/email-marketing/campaigns` : "/admin/email-marketing/campaigns");
  }
  const emailSenders = await db.emailSenders.getAllEmailSenders(tenantId);
  const data: LoaderData = {
    title: `${item.name} | ${process.env.APP_NAME}`,
    item,
    emailSenders,
    allEntities: await db.entities.getAllEntities(null),
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
  const item = await db.campaigns.getCampaign(params.id!, tenantId);
  if (!item) {
    return Response.json({ error: t("shared.notFound") }, { status: 404 });
  }
  if (action === "delete") {
    try {
      await db.campaigns.deleteCampaign(params.id!, tenantId);
      return redirect(params.tenant ? `/app/${params.tenant}/email-marketing/campaigns` : "/admin/email-marketing/campaigns");
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else if (action === "update") {
    try {
      await db.campaigns.updateCampaign(params.id!, {
        name: form.get("name")?.toString(),
        subject: form.get("subject")?.toString(),
        htmlBody: form.get("htmlBody")?.toString(),
        textBody: form.get("textBody")?.toString(),
        // status: form.get("status")?.toString(),
      });
      return Response.json({ success: t("shared.saved") });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else if (action === "send") {
    try {
      await EmailMarketingService.sendCampaign(item);
      return Response.json({ success: t("shared.sent") }, { status: 200 });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else if (action === "send-preview") {
    try {
      const email = form.get("email")?.toString() ?? "";
      await EmailMarketingService.sendCampaignTest(item, email);
      return Response.json({ success: t("shared.sent") }, { status: 200 });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else {
    return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

