import { Prisma } from "@prisma/client";
import { OutboundEmailWithDetailsDto } from "@/db/models/email/OutboundEmailsModel";
import { PaginationDto } from "@/lib/dtos/PaginationDto";

export interface IOutboundEmailsDb {
  getAllOutboundEmails(
    tenantId: string | null,
    options: {
      where?: Prisma.OutboundEmailWhereInput | undefined;
      pagination: {
        page: number;
        pageSize: number;
      };
    }
  ): Promise<{
    items: OutboundEmailWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  findOutboundEmails(
    tenantId: string | null,
    options: {
      where?: Prisma.OutboundEmailWhereInput;
    }
  ): Promise<OutboundEmailWithDetailsDto[]>;
  getOutboundEmail(id: string): Promise<
    | ({
        campaign: {
          name: string;
          id: string;
          tenantId: string | null;
          sentAt: Date | null;
          emailSenderId: string;
          subject: string;
          htmlBody: string;
          textBody: string | null;
          status: string;
          track: boolean;
        } | null;
        opens: {
          id: string;
          createdAt: Date;
          firstOpen: boolean;
          outboundEmailId: string;
        }[];
        clicks: {
          id: string;
          createdAt: Date;
          outboundEmailId: string;
          link: string;
        }[];
      } & {
        id: string;
        createdAt: Date;
        tenantId: string | null;
        campaignId: string | null;
        contactRowId: string | null;
        email: string;
        fromSenderId: string;
        isPreview: boolean | null;
        unsubscribedAt: Date | null;
        bouncedAt: Date | null;
      })
    | null
  >;
  createOutboundEmailTest(data: { tenantId: string | null; contactRowId?: string | undefined; email: string; fromSenderId: string }): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string | null;
    campaignId: string | null;
    contactRowId: string | null;
    email: string;
    fromSenderId: string;
    isPreview: boolean | null;
    error: string | null;
    sentAt: Date | null;
    deliveredAt: Date | null;
    bouncedAt: Date | null;
    spamComplainedAt: Date | null;
    unsubscribedAt: Date | null;
  }>;
  createOutboundEmail(data: { tenantId: string | null; contactRowId: string; email: string; fromSenderId: string; campaignId?: string | undefined }): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string | null;
    campaignId: string | null;
    contactRowId: string | null;
    email: string;
    fromSenderId: string;
    isPreview: boolean | null;
    error: string | null;
    sentAt: Date | null;
    deliveredAt: Date | null;
    bouncedAt: Date | null;
    spamComplainedAt: Date | null;
    unsubscribedAt: Date | null;
  }>;
  updateOutboundEmail(
    id: string,
    data: {
      error?: string | undefined;
      sentAt?: Date | undefined;
      deliveredAt?: Date | undefined;
      bouncedAt?: Date | undefined;
      spamComplainedAt?: Date | undefined;
      unsubscribedAt?: Date | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string | null;
    campaignId: string | null;
    contactRowId: string | null;
    email: string;
    fromSenderId: string;
    isPreview: boolean | null;
    error: string | null;
    sentAt: Date | null;
    deliveredAt: Date | null;
    bouncedAt: Date | null;
    spamComplainedAt: Date | null;
    unsubscribedAt: Date | null;
  }>;
  openedOutboundEmail(
    outboundEmailId: string,
    data: {
      firstOpen: boolean;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    firstOpen: boolean;
    outboundEmailId: string;
  }>;
  clickedOutboundEmail(
    outboundEmailId: string,
    data: {
      link: string;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    outboundEmailId: string;
    link: string;
  }>;
  unsubscribeCampaignRecipient(
    id: string,
    data: {
      unsubscribedAt: Date;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string | null;
    campaignId: string | null;
    contactRowId: string | null;
    email: string;
    fromSenderId: string;
    isPreview: boolean | null;
    error: string | null;
    sentAt: Date | null;
    deliveredAt: Date | null;
    bouncedAt: Date | null;
    spamComplainedAt: Date | null;
    unsubscribedAt: Date | null;
  }>;
  countOutboundEmails(
    tenantId: string | null,
    options?:
      | {
          where: Prisma.OutboundEmailWhereInput;
        }
      | undefined
  ): Promise<number>;
}
