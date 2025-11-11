import { EmailSenderWithoutApiKeyDto } from "@/db/models/email/EmailSenderModel";

export interface IEmailSenderDb {
  getAllEmailSenders(tenantId: string | null): Promise<EmailSenderWithoutApiKeyDto[]>;
  getEmailSender(
    id: string,
    tenantId: string | null
  ): Promise<{
    id: string;
    tenantId: string | null;
    provider: string;
    stream: string;
    apiKey: string;
    fromEmail: string;
    fromName: string | null;
    replyToEmail: string | null;
  } | null>;
  getEmailSenderWithoutApiKey(id: string, tenantId: string | null): Promise<EmailSenderWithoutApiKeyDto | null>;
  createEmailSender(data: {
    tenantId: string | null;
    provider: string;
    stream: string;
    apiKey: string;
    fromEmail: string;
    fromName?: string | undefined;
    replyToEmail?: string | undefined;
  }): Promise<{
    id: string;
    tenantId: string | null;
    provider: string;
    stream: string;
    apiKey: string;
    fromEmail: string;
    fromName: string | null;
    replyToEmail: string | null;
  }>;
  updateEmailSender(
    id: string,
    data: {
      provider: string;
      stream: string;
      fromEmail: string;
      fromName?: string | undefined;
      replyToEmail?: string | undefined;
    }
  ): Promise<{
    id: string;
    tenantId: string | null;
    provider: string;
    stream: string;
    apiKey: string;
    fromEmail: string;
    fromName: string | null;
    replyToEmail: string | null;
  }>;
  deleteEmailSender(id: string): Promise<{
    id: string;
    tenantId: string | null;
    provider: string;
    stream: string;
    apiKey: string;
    fromEmail: string;
    fromName: string | null;
    replyToEmail: string | null;
  }>;
}
