export type EntityTemplatesModel = {
  title: string;
  id: string;
  createdAt: Date;
  tenantId: string | null;
  entityId: string;
  config: string;
};
