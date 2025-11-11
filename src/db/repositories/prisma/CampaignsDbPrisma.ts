import { ICampaignsDb } from "@/db/interfaces/email/ICampaignsDb";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
import { CampaignWithDetailsDto } from "@/db/models/email/CampaignsModel";
import { prisma } from "@/db/config/prisma/database";
import { Campaign } from "@prisma/client";
export class CampaignsDbPrisma implements ICampaignsDb {
  async getAllCampaigns(tenantId: string | null, status?: string): Promise<CampaignWithDetailsDto[]> {
    return await prisma.campaign.findMany({
      where: {
        tenantId,
        status,
      },
      include: {
        emailSender: true,
        recipients: {
          include: {
            campaign: true,
            opens: true,
            clicks: true,
            contactRow: {
              include: {
                createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
                createdByApiKey: true,
                values: { include: { media: true, multiple: true, range: true } },
              },
            },
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
    });
  }

  async getCampaign(id: string, tenantId: string | null): Promise<CampaignWithDetailsDto | null> {
    return await prisma.campaign.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        emailSender: true,
        recipients: {
          include: {
            campaign: true,
            opens: true,
            clicks: true,
            contactRow: {
              include: {
                createdByUser: { select: UserModelHelper.selectSimpleUserProperties },
                createdByApiKey: true,
                values: { include: { media: true, multiple: true, range: true } },
              },
            },
          },
        },
      },
    });
  }

  async createCampaign(
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
  ): Promise<Campaign> {
    const item = await prisma.campaign.create({
      data: {
        ...data,
        recipients: {
          create: recipients.map((recipient) => {
            return {
              tenantId: data.tenantId,
              contactRowId: recipient.contactRowId,
              email: recipient.email,
              fromSenderId: recipient.fromSenderId,
            };
          }),
        },
      },
    });

    return item;
  }

  async updateCampaign(
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
  ): Promise<Campaign> {
    const item = await prisma.campaign.update({
      where: {
        id,
      },
      data,
    });
    if (recipients) {
      await prisma.outboundEmail.deleteMany({
        where: {
          campaignId: id,
        },
      });
      await prisma.outboundEmail.createMany({
        data: recipients.map((recipient) => {
          return {
            tenantId: item.tenantId,
            campaignId: id,
            contactRowId: recipient.contactRowId,
            email: recipient.email,
            fromSenderId: recipient.fromSenderId,
          };
        }),
      });
    }

    return item;
  }

  async deleteCampaign(id: string, tenantId: string | null) {
    return await prisma.campaign.deleteMany({
      where: {
        id,
        tenantId,
      },
    });
  }

  async groupCampaigns(tenantId: string | null) {
    return await prisma.campaign.groupBy({
      by: ["status"],
      where: {
        tenantId,
      },
      _count: {
        _all: true,
      },
    });
  }
}
