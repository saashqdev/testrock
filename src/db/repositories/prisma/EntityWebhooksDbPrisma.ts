import { IEntityWebhooksDb } from "@/db/interfaces/entityBuilder/IEntityWebhooksDb";
import { prisma } from "@/db/config/prisma/database";
import { getBaseURL } from "@/utils/url.server";
export class EntityWebhooksDbPrisma implements IEntityWebhooksDb {
  async getEntityWebhooks(entityId: string) {
    return await prisma.entityWebhook.findMany({
      where: {
        entityId,
      },
      include: {
        _count: {
          select: {
            logs: true,
          },
        },
      },
    });
  }

  async getEntityWebhook(id: string) {
    return await prisma.entityWebhook.findUnique({
      where: {
        id,
      },
    });
  }

  async getEntityWebhooksByAction(entityId: string, action: string) {
    return await prisma.entityWebhook.findMany({
      where: {
        entityId,
        action,
      },
    });
  }

  async createEntityWebhook(data: { entityId: string; action: string; method: string; endpoint: string }) {
    return await prisma.entityWebhook.create({
      data,
    });
  }

  async updateEntityWebhook(
    id: string,
    data: {
      action: string;
      method: string;
      endpoint: string;
    }
  ) {
    return await prisma.entityWebhook.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteEntityWebhook(id: string) {
    return await prisma.entityWebhook.delete({
      where: {
        id,
      },
    });
  }

  async callEntityWebhooks({ logId, entityId, action, body, request }: { logId: string; entityId: string; action: string; body: string; request?: Request }) {
    const webhooks = await this.getEntityWebhooksByAction(entityId, action);
    return await Promise.all(
      webhooks.map(async (webhook) => {
        if (webhook.endpoint) {
          let endpoint = webhook.endpoint; //start edit
          if (endpoint.startsWith("/") && request) {
            endpoint = getBaseURL() + endpoint;
          }
          const response = await fetch(endpoint, {
            //end edit
            method: webhook.method,
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
          });
          // eslint-disable-next-line no-console
          console.log({ response });
          return prisma.entityWebhookLog.create({
            data: {
              webhookId: webhook.id,
              logId,
              status: response.status,
            },
          });
        }
      })
    );
  }
}
