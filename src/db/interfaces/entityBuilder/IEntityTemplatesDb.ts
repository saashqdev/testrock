export interface IEntityTemplatesDb {
  getEntityTemplates(
    entityId: string,
    {
      tenantId,
    }: {
      tenantId: string | null;
    }
  ): Promise<
    {
      tenantId: string | null;
      id: string;
      createdAt: Date;
      entityId: string;
      title: string;
      config: string;
    }[]
  >;
  getEntityTemplate(
    id: string,
    {
      tenantId,
    }: {
      tenantId: string | null;
    }
  ): Promise<{
    tenantId: string | null;
    id: string;
    createdAt: Date;
    entityId: string;
    title: string;
    config: string;
  } | null>;
  createEntityTemplate(data: { tenantId: string | null; entityId: string; title: string; config: string }): Promise<{
    tenantId: string | null;
    id: string;
    createdAt: Date;
    entityId: string;
    title: string;
    config: string;
  }>;
  updateEntityTemplate(
    id: string,
    data: { title: string; config: string }
  ): Promise<{
    tenantId: string | null;
    id: string;
    createdAt: Date;
    entityId: string;
    title: string;
    config: string;
  }>;
  deleteEntityTemplate(id: string): Promise<{
    tenantId: string | null;
    id: string;
    createdAt: Date;
    entityId: string;
    title: string;
    config: string;
  }>;
}
