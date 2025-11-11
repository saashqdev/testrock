import { IOutboundEmailsDb } from "@/db/interfaces/email/IOutboundEmailsDb";
import { Prisma, OutboundEmail } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import * as Constants from "@/lib/constants";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
import { OutboundEmailWithDetailsDto } from "@/db/models/email/OutboundEmailsModel";
export class OutboundEmailsDbPrisma implements IOutboundEmailsDb {
  async getAllOutboundEmails(
    tenantId: string | null,
    options: {
      where?: Prisma.OutboundEmailWhereInput;
      pagination: { page: number; pageSize: number };
    }
  ): Promise<{ items: OutboundEmailWithDetailsDto[]; pagination: PaginationDto }> {
    const itemsRaw = await prisma.outboundEmail.findMany({
      take: options.pagination.pageSize,
      skip: options.pagination.pageSize * (options.pagination.page - 1),
      where: {
        tenantId,
        ...options.where,
      },
      include: {
        campaign: true,
        opens: true,
        clicks: true,
        contactRow: {
          include: {
            createdByUser: { select: UserModelHelper.selectWithAvatar },
            createdByApiKey: true,
            values: { include: { media: true, multiple: true, range: true } },
          },
        },
      },
      orderBy: [{ sentAt: "desc" }],
    });
    const items: OutboundEmailWithDetailsDto[] = itemsRaw.map((item) => ({
      ...item,
      contactRow: item.contactRow
        ? {
            ...item.contactRow,
            createdByUser: item.contactRow.createdByUser
              ? {
                  id: item.contactRow.createdByUser.id,
                  email: item.contactRow.createdByUser.email,
                  username: item.contactRow.createdByUser.username,
                  firstName: item.contactRow.createdByUser.firstName,
                  lastName: item.contactRow.createdByUser.lastName,
                  phone: item.contactRow.createdByUser.phone,
                  githubId: item.contactRow.createdByUser.githubId,
                  googleId: item.contactRow.createdByUser.googleId,
                  locale: item.contactRow.createdByUser.locale,
                  createdAt: item.contactRow.createdByUser.createdAt,
                }
              : null,
            createdByApiKey: item.contactRow.createdByApiKey,
            values: item.contactRow.values,
          }
        : null,
    }));
    const totalItems = await prisma.outboundEmail.count({
      where: {
        tenantId,
        ...options.where,
      },
    });
    return {
      items,
      pagination: {
        page: options.pagination?.page ?? 1,
        pageSize: options.pagination.pageSize ?? Constants.DEFAULT_PAGE_SIZE,
        totalItems,
        totalPages: Math.ceil(totalItems / (options.pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE)),
      },
    };
  }

  async findOutboundEmails(
    tenantId: string | null,
    options: {
      where?: Prisma.OutboundEmailWhereInput;
    }
  ): Promise<OutboundEmailWithDetailsDto[]> {
    const results = await prisma.outboundEmail.findMany({
      where: {
        tenantId,
        ...options.where,
      },
      include: {
        campaign: true,
        opens: true,
        clicks: true,
        contactRow: {
          include: {
            createdByUser: { select: UserModelHelper.selectWithAvatar },
            createdByApiKey: true,
            values: { include: { media: true, multiple: true, range: true } },
          },
        },
      },
      orderBy: [{ sentAt: "desc" }],
    });

    // Map the Prisma result to OutboundEmailWithDetailsDto
    return results.map((item) => ({
      ...item,
      contactRow: item.contactRow
        ? {
            ...item.contactRow,
            createdByUser: item.contactRow.createdByUser
              ? {
                  id: item.contactRow.createdByUser.id,
                  email: item.contactRow.createdByUser.email,
                  username: item.contactRow.createdByUser.username,
                  firstName: item.contactRow.createdByUser.firstName,
                  lastName: item.contactRow.createdByUser.lastName,
                  phone: item.contactRow.createdByUser.phone,
                  githubId: item.contactRow.createdByUser.githubId,
                  googleId: item.contactRow.createdByUser.googleId,
                  locale: item.contactRow.createdByUser.locale,
                  createdAt: item.contactRow.createdByUser.createdAt,
                }
              : null,
            createdByApiKey: item.contactRow.createdByApiKey,
            values: item.contactRow.values,
          }
        : null,
    }));
  }

  async getOutboundEmail(id: string) {
    return await prisma.outboundEmail.findFirst({
      where: {
        id,
      },
      include: {
        campaign: true,
        opens: true,
        clicks: true,
      },
    });
  }

  async createOutboundEmailTest(data: { tenantId: string | null; contactRowId?: string; email: string; fromSenderId: string }): Promise<OutboundEmail> {
    const item = await prisma.outboundEmail.create({
      data: {
        ...data,
        isPreview: true,
      },
    });
    return item;
  }

  async createOutboundEmail(data: {
    tenantId: string | null;
    contactRowId: string;
    email: string;
    fromSenderId: string;
    campaignId?: string;
  }): Promise<OutboundEmail> {
    const item = await prisma.outboundEmail.create({
      data,
    });
    return item;
  }

  async updateOutboundEmail(
    id: string,
    data: {
      error?: string;
      sentAt?: Date;
      deliveredAt?: Date;
      bouncedAt?: Date;
      spamComplainedAt?: Date;
      unsubscribedAt?: Date;
    }
  ) {
    const item = await prisma.outboundEmail.update({
      where: {
        id,
      },
      data,
    });

    return item;
  }

  async openedOutboundEmail(outboundEmailId: string, data: { firstOpen: boolean }) {
    const item = await prisma.outboundEmailOpen.create({
      data: {
        outboundEmailId,
        firstOpen: data.firstOpen,
      },
    });

    return item;
  }

  async clickedOutboundEmail(
    outboundEmailId: string,
    data: {
      link: string;
    }
  ) {
    const item = await prisma.outboundEmailClick.create({
      data: {
        outboundEmailId,
        link: data.link,
      },
    });

    return item;
  }

  async unsubscribeCampaignRecipient(
    id: string,
    data: {
      unsubscribedAt: Date;
    }
  ) {
    const item = await prisma.outboundEmail.update({
      where: {
        id,
      },
      data,
    });

    return item;
  }

  async countOutboundEmails(
    tenantId: string | null,
    options?: {
      where: Prisma.OutboundEmailWhereInput;
    }
  ): Promise<number> {
    return await prisma.outboundEmail.count({
      where: {
        tenantId,
        ...options?.where,
      },
    });
  }
}
