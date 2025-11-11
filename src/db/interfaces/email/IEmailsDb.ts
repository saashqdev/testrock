import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { EmailWithSimpleDetailsDto, EmailWithDetailsDto } from "@/db/models/email/EmailsModel";

export interface IEmailsDb {
  getAllEmails(
    type: string,
    pagination: {
      page: number;
      pageSize: number;
    },
    filters?: FiltersDto | undefined,
    tenantId?: string | null
  ): Promise<{
    items: EmailWithSimpleDetailsDto[];
    pagination: PaginationDto;
  }>;
  getEmail(id: string, tenantId?: string | null | undefined): Promise<EmailWithDetailsDto | null>;
  getEmailByMessageId(messageId: string): Promise<EmailWithDetailsDto | null>;
  createEmail(data: {
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
  }): Promise<{
    id: string;
    tenantInboundAddressId: string | null;
    messageId: string;
    type: string;
    date: Date;
    subject: string;
    fromEmail: string;
    fromName: string | null;
    toEmail: string;
    toName: string | null;
    textBody: string;
    htmlBody: string;
  }>;
  getEmailReads(
    id: string,
    readByUserId: string
  ): Promise<
    {
      id: string;
      createdAt: Date;
      emailId: string;
      userId: string;
    }[]
  >;
  createEmailRead(
    emailId: string,
    userId: string
  ): Promise<{
    id: string;
    createdAt: Date;
    emailId: string;
    userId: string;
  }>;
  deleteEmail(id: string): Promise<{
    id: string;
    tenantInboundAddressId: string | null;
    messageId: string;
    type: string;
    date: Date;
    subject: string;
    fromEmail: string;
    fromName: string | null;
    toEmail: string;
    toName: string | null;
    textBody: string;
    htmlBody: string;
  }>;
  whereInboundAddress(tenantId?: string | null | undefined): Promise<
    | {
        tenantInboundAddress: {
          is: null;
          tenantId?: undefined;
        };
      }
    | {
        tenantInboundAddress: {
          tenantId: string;
          is?: undefined;
        };
      }
  >;
}
