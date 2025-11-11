import { Campaign, OutboundEmail, OutboundEmailClick, OutboundEmailOpen } from "@prisma/client";
import { RowWithValuesDto } from "@/db/models/entityBuilder/RowsModel";

export type OutboundEmailsModel = {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  sentAt: Date | null;
};

export type OutboundEmailWithDetailsDto = OutboundEmail & {
  campaign: Campaign | null;
  opens: OutboundEmailOpen[];
  clicks: OutboundEmailClick[];
  contactRow: RowWithValuesDto | null;
};
