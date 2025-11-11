export interface IEventWebhookAttemptsDb {
  createEventWebhookAttempt(data: { eventId: string; endpoint: string }): Promise<{
    id: string;
    createdAt: Date;
    startedAt: Date | null;
    finishedAt: Date | null;
    endpoint: string;
    success: boolean | null;
    status: number | null;
    message: string | null;
    body: string | null;
    eventId: string;
  }>;
  updateEventWebhookAttempt(
    id: string,
    data: {
      startedAt?: Date | undefined;
      finishedAt?: Date | undefined;
      success?: boolean | undefined;
      status?: number | undefined;
      message?: string | undefined;
      body?: string | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    startedAt: Date | null;
    finishedAt: Date | null;
    endpoint: string;
    success: boolean | null;
    status: number | null;
    message: string | null;
    body: string | null;
    eventId: string;
  }>;
  deleteEventWebhookAttempt(id: string): Promise<{
    id: string;
    createdAt: Date;
    startedAt: Date | null;
    finishedAt: Date | null;
    endpoint: string;
    success: boolean | null;
    status: number | null;
    message: string | null;
    body: string | null;
    eventId: string;
  }>;
}
