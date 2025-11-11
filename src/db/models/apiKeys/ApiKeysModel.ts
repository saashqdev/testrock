import { ApiKey, ApiKeyEntity, ApiKeyLog, Tenant } from "@prisma/client";
import { UserDto } from "@/db/models/accounts/UsersModel";

export type ApiKeysModel = {
  id: string;
  key: string;
  active: boolean;
  tenantId: string;
};

export type ApiKeyWithDetailsDto = ApiKey & {
  tenant: { id: string; name: string; slug: string; deactivatedReason: string | null };
  entities: (ApiKeyEntity & { entity: { id: string; title: string; titlePlural: string; slug: string } })[];
  createdByUser: UserDto;
  _count: { apiKeyLogs: number };
};

export type ApiKeyLogWithDetailsDto = ApiKeyLog & {
  apiKey: (ApiKey & { tenant: Tenant }) | null;
};
export type ApiKeyLogDto = { apiKeyId: string | null; status: number | null };

export type ApiKeyDto = {
  id: string;
  alias: string;
  expires: Date | null;
  tenantId: string;
  active: boolean;
  entities: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    entityId: string;
  }[];
  tenant: { id: string; name: string; slug: string; deactivatedReason: string | null };
};
