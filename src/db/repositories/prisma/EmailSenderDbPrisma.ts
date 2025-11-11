import { IEmailSenderDb } from "@/db/interfaces/email/IEmailSenderDb";
import { EmailSender } from "@prisma/client";
import { EmailSenderWithoutApiKeyDto } from "@/db/models/email/EmailSenderModel";
import { prisma } from "@/db/config/prisma/database";

export class EmailSenderDbPrisma implements IEmailSenderDb {
  async getAllEmailSenders(tenantId: string | null): Promise<EmailSenderWithoutApiKeyDto[]> {
    return await prisma.emailSender.findMany({
      where: {
        tenantId,
      },
      select: {
        id: true,
        tenantId: true,
        provider: true,
        stream: true,
        fromName: true,
        fromEmail: true,
        replyToEmail: true,
      },
      orderBy: [
        {
          fromName: "asc",
        },
      ],
    });
  }

  async getEmailSender(id: string, tenantId: string | null): Promise<EmailSender | null> {
    return await prisma.emailSender.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  async getEmailSenderWithoutApiKey(id: string, tenantId: string | null): Promise<EmailSenderWithoutApiKeyDto | null> {
    return await prisma.emailSender.findFirst({
      where: {
        id,
        tenantId,
      },
      select: {
        id: true,
        tenantId: true,
        provider: true,
        stream: true,
        fromName: true,
        fromEmail: true,
        replyToEmail: true,
      },
    });
  }

  async createEmailSender(data: {
    tenantId: string | null;
    provider: string;
    stream: string;
    apiKey: string;
    fromEmail: string;
    fromName?: string;
    replyToEmail?: string;
  }): Promise<EmailSender> {
    const item = await prisma.emailSender.create({
      data,
    });

    return item;
  }

  async updateEmailSender(
    id: string,
    data: {
      provider: string;
      stream: string;
      fromEmail: string;
      fromName?: string;
      replyToEmail?: string;
    }
  ): Promise<EmailSender> {
    const item = await prisma.emailSender.update({
      where: { id },
      data,
    });

    return item;
  }

  async deleteEmailSender(id: string): Promise<EmailSender> {
    await prisma.outboundEmail.deleteMany({
      where: { fromSenderId: id },
    });
    const item = await prisma.emailSender.delete({
      where: { id },
    });

    return item;
  }
}
