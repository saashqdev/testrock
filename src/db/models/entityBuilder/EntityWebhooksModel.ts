import { EntityWebhook } from "@prisma/client";

export type EntityWebhookModel = {
  id: string;
  entityId: string;
  url: string;
  event: string;
  isActive: boolean;
};

export type EntityWebhookWithDetailsDto = EntityWebhook & { _count: { logs: number } };
