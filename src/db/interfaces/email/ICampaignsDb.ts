import { CampaignWithDetailsDto } from "@/db/models/email/CampaignsModel";
import { Prisma, Campaign } from "@prisma/client";
export interface ICampaignsDb {
  getAllCampaigns(tenantId: string | null, status?: string): Promise<CampaignWithDetailsDto[]>;
  getCampaign(id: string, tenantId: string | null): Promise<CampaignWithDetailsDto | null>;
  createCampaign(
    data: {
      emailSenderId: string;
      tenantId: string | null;
      name: string;
      subject: string;
      htmlBody: string;
      textBody: string | undefined;
      track: boolean;
    },
    recipients: { fromSenderId: string; email: string; contactRowId: string }[]
  ): Promise<Campaign>;
  updateCampaign(
    id: string,
    data: {
      name?: string;
      subject?: string;
      htmlBody?: string;
      textBody?: string | undefined;
      status?: string;
      track?: boolean;
      sentAt?: Date;
    },
    recipients?: { fromSenderId: string; email: string; contactRowId: string }[]
  ): Promise<Campaign>;
  deleteCampaign(id: string, tenantId: string | null): Promise<Prisma.BatchPayload>;
  groupCampaigns(tenantId: string | null): Promise<(Prisma.PickEnumerable<Prisma.CampaignGroupByOutputType, "status"[]> & { _count: { _all: number } })[]>;
}
