import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { CampaignWithDetailsDto } from "@/db/models/email/CampaignsModel";
import { EmailSenderWithoutApiKeyDto } from "@/db/models/email/EmailSenderModel";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export namespace Campaigns_List {
  export type LoaderData = {
    title: string;
    items: CampaignWithDetailsDto[];
    groupByStatus: {
      status: string;
      count: number;
    }[];
    emailSenders: EmailSenderWithoutApiKeyDto[];
  };
  export const loader = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
    await requireAuth();
    const tenantId = await getTenantIdOrNull({ request, params });
    const searchParams = new URL(request.url).searchParams;
    const status = searchParams.get("status")?.toString();
    const items = await db.campaigns.getAllCampaigns(tenantId, status);
    const campaignsCount = await db.campaigns.groupCampaigns(tenantId);
    const groupByStatus = campaignsCount.map((item) => {
      return {
        status: item.status,
        count: item._count._all,
      };
    });
    const data: LoaderData = {
      title: `Campaigns | ${process.env.APP_NAME}`,
      items,
      groupByStatus,
      emailSenders: await db.emailSenders.getAllEmailSenders(tenantId),
    };
    return data;
  };
}
