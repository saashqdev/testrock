import { Email, EmailAttachment, EmailCc, EmailRead, TenantInboundAddress } from "@prisma/client";

export type EmailModel = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  sentAt: Date | null;
  status: "pending" | "sent" | "failed";
};

export type EmailWithSimpleDetailsDto = Email & {
  tenantInboundAddress?: (TenantInboundAddress & { tenant: { name: string } }) | null;
  cc: EmailCc[];
  _count: { attachments: number; reads: number };
};

export type EmailWithDetailsDto = Email & {
  tenantInboundAddress?: TenantInboundAddress | null;
  cc: EmailCc[];
  reads: EmailRead[];
  attachments: EmailAttachment[];
};
