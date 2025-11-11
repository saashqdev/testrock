export interface IEntityWebhooksDb {
  getEntityWebhooks(entityId: string): Promise<
    ({
      _count: {
        logs: number;
      };
    } & {
      id: string;
      entityId: string;
      action: string;
      method: string;
      endpoint: string;
    })[]
  >;
  getEntityWebhook(id: string): Promise<{
    id: string;
    entityId: string;
    action: string;
    method: string;
    endpoint: string;
  } | null>;
  getEntityWebhooksByAction(
    entityId: string,
    action: string
  ): Promise<
    {
      id: string;
      entityId: string;
      action: string;
      method: string;
      endpoint: string;
    }[]
  >;
  createEntityWebhook(data: { entityId: string; action: string; method: string; endpoint: string }): Promise<{
    id: string;
    entityId: string;
    action: string;
    method: string;
    endpoint: string;
  }>;
  updateEntityWebhook(
    id: string,
    data: {
      action: string;
      method: string;
      endpoint: string;
    }
  ): Promise<{
    id: string;
    entityId: string;
    action: string;
    method: string;
    endpoint: string;
  }>;
  deleteEntityWebhook(id: string): Promise<{
    id: string;
    entityId: string;
    action: string;
    method: string;
    endpoint: string;
  }>;
  callEntityWebhooks({
    logId,
    entityId,
    action,
    body,
    request,
  }: {
    logId: string;
    entityId: string;
    action: string;
    body: string;
    request?: Request | undefined;
  }): Promise<
    (
      | {
          error: string | null;
          id: string;
          webhookId: string;
          logId: string;
          status: number;
        }
      | undefined
    )[]
  >;
}
