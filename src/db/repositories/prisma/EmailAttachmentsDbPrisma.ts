import { IEmailAttachmentsDb } from "@/db/interfaces/email/IEmailAttachmentsDb";
import { prisma } from "@/db/config/prisma/database";
export class EmailAttachmentsDbPrisma implements IEmailAttachmentsDb {
  async updateEmailAttachmentFileProvider(
    id: string,
    data: {
      content?: string;
      publicUrl?: string | null;
      storageBucket?: string | null;
      storageProvider?: string | null;
    }
  ) {
    await prisma.emailAttachment.update({
      where: {
        id,
      },
      data,
    });
  }
}
