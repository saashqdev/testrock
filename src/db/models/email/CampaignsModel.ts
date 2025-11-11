import { Campaign, EmailSender, OutboundEmail, OutboundEmailOpen, OutboundEmailClick } from "@prisma/client";
import { RowWithValuesDto } from "@/db/models/entityBuilder/RowsModel";

export type CampaignsModel = {
  id: string;
  name: string;
  subject: string;
  senderId: string;
  templateId: string;
  scheduledAt?: Date;
  status: "draft" | "scheduled" | "sent" | "canceled";
};

export type CampaignWithDetailsDto = Campaign & {
  emailSender: EmailSender;
  recipients: (OutboundEmail & {
    campaign: Campaign | null;
    opens: OutboundEmailOpen[];
    clicks: OutboundEmailClick[];
    contactRow: RowWithValuesDto | null;
  })[];
};
