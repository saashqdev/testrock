import { IEventWebhookAttemptsDb } from "@/db/interfaces/events/IEventWebhookAttemptsDb";
import { prisma } from "@/db/config/prisma/database";
export class EventWebhookAttemptsDbPrisma implements IEventWebhookAttemptsDb {
  async createEventWebhookAttempt(data: { eventId: string; endpoint: string }) {
    return await prisma.eventWebhookAttempt.create({
      data,
    });
  }

  async updateEventWebhookAttempt(
    id: string,
    data: { startedAt?: Date; finishedAt?: Date; success?: boolean; status?: number; message?: string; body?: string }
  ) {
    return await prisma.eventWebhookAttempt.update({
      where: { id },
      data,
    });
  }

  async deleteEventWebhookAttempt(id: string) {
    return await prisma.eventWebhookAttempt.delete({
      where: { id },
    });
  }
}
