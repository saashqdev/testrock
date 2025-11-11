import { IEmailsDb } from "@/db/interfaces/email/IEmailsDb";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import RowFiltersHelper from "@/lib/helpers/RowFiltersHelper";
import { EmailWithSimpleDetailsDto, EmailWithDetailsDto } from "@/db/models/email/EmailsModel";
import { prisma } from "@/db/config/prisma/database";
import { EmailRead } from "@prisma/client";

export class EmailsDbPrisma implements IEmailsDb {
  async getAllEmails(
    type: string,
    pagination: { page: number; pageSize: number },
    filters?: FiltersDto,
    tenantId?: string | null
  ): Promise<{ items: EmailWithSimpleDetailsDto[]; pagination: PaginationDto }> {
    const whereFilters = RowFiltersHelper.getFiltersCondition(filters);
    const where = tenantId ? { AND: [{ type }, { ...this.whereInboundAddress(tenantId) }, whereFilters] } : { AND: [{ type }, whereFilters] };
    const items = await prisma.email.findMany({
      take: pagination.pageSize,
      skip: pagination.pageSize * (pagination.page - 1),
      where,
      include: {
        tenantInboundAddress: {
          include: { tenant: { select: { name: true } } },
        },
        cc: true,
        _count: {
          select: {
            attachments: true,
            reads: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const totalItems = await prisma.email.count({ where });

    return {
      items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.pageSize),
      },
    };
  }

  async getEmail(id: string, tenantId?: string | null): Promise<EmailWithDetailsDto | null> {
    const where = tenantId === null ? { id } : { id, ...this.whereInboundAddress(tenantId) };
    return prisma.email.findFirst({
      where,
      include: {
        tenantInboundAddress: true,
        cc: true,
        attachments: true,
        reads: true,
      },
    });
  }

  async getEmailByMessageId(messageId: string): Promise<EmailWithDetailsDto | null> {
    return prisma.email.findFirst({
      where: {
        messageId,
      },
      include: {
        tenantInboundAddress: true,
        cc: true,
        attachments: true,
        reads: true,
      },
    });
  }

  async createEmail(data: {
    tenantInboundAddressId: string | null;
    messageId: any;
    type: string;
    date: Date;
    subject: any;
    fromEmail: any;
    fromName: any;
    toEmail: any;
    toName: any;
    textBody: any;
    htmlBody: any;
    cc: {
      create: any;
    };
    attachments?:
      | {
          create?: any;
        }
      | undefined;
  }) {
    return prisma.email.create({
      data,
    });
  }

  async getEmailReads(id: string, readByUserId: string): Promise<EmailRead[]> {
    return prisma.emailRead.findMany({
      where: {
        emailId: id,
        userId: readByUserId,
      },
    });
  }

  async createEmailRead(emailId: string, userId: string): Promise<EmailRead> {
    return prisma.emailRead.create({
      data: {
        emailId,
        userId,
      },
    });
  }

  async deleteEmail(id: string) {
    return prisma.email.delete({
      where: { id },
    });
  }

  async whereInboundAddress(tenantId?: string | null) {
    if (!tenantId) {
      return {
        tenantInboundAddress: {
          is: null,
        },
      };
    } else {
      return {
        tenantInboundAddress: {
          tenantId,
        },
      };
    }
  }
}
