import { ApiKeyDto, ApiKeyLogDto, ApiKeyLogWithDetailsDto, ApiKeyWithDetailsDto } from "@/db/models";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationDto } from "@/lib/dtos/PaginationDto";

export interface IApiKeysDb {
  getAllApiKeys(): Promise<ApiKeyWithDetailsDto[]>;
  getAllApiKeyLogs(
    pagination: {
      page: number;
      pageSize: number;
    },
    filters: FiltersDto
  ): Promise<{
    items: ApiKeyLogWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  getAllApiKeyLogsSimple(tenantId?: string | undefined): Promise<ApiKeyLogDto[]>;
  getTenantApiKeyLogs(
    tenantId: string,
    pagination: {
      page: number;
      pageSize: number;
    },
    filters: FiltersDto
  ): Promise<{
    items: ApiKeyLogWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  getApiKeys(tenantId: string): Promise<ApiKeyWithDetailsDto[]>;
  getApiKeyById(id: string): Promise<ApiKeyWithDetailsDto | null>;
  getApiKey(key: string): Promise<ApiKeyDto | null>;
  getApiKeyByAlias(tenantId: string, alias: string): Promise<ApiKeyWithDetailsDto | null>;
  getApiKeyLogs(id: string): Promise<ApiKeyLogWithDetailsDto[]>;
  getFirstApiKey(tenantId: string | null): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string;
    createdByUserId: string;
    key: string;
    alias: string;
    expires: Date | null;
    active: boolean;
  } | null>;
  createApiKey(
    data: {
      tenantId: string;
      createdByUserId: string;
      alias: string;
      expires: Date | null;
      active: boolean;
    },
    entities: {
      entityId: string;
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    }[]
  ): Promise<{
    id: string;
    createdAt: Date;
    createdByUserId: string;
    tenantId: string;
    key: string;
    alias: string;
    expires: Date | null;
    active: boolean;
  }>;
  createApiKeyLog(
    request: Request,
    data: {
      tenantId: string | null;
      apiKeyId: string | null;
      endpoint: string;
      error?: string | undefined;
      status?: number | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    apiKeyId: string | null;
    tenantId: string | null;
    ip: string;
    endpoint: string;
    method: string;
    params: string;
    status: number | null;
    duration: number | null;
    error: string | null;
    type: string | null;
  }>;
  setApiKeyLogStatus(
    id: string,
    data: {
      status: number;
      startTime: number | null;
      error?: string | null | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string | null;
    apiKeyId: string | null;
    ip: string;
    endpoint: string;
    method: string;
    params: string;
    status: number | null;
    duration: number | null;
    error: string | null;
    type: string | null;
  }>;
  updateApiKey(
    id: string,
    data: {
      tenantId: string;
      alias: string;
      expires: Date | null;
      active: boolean;
    },
    entities: {
      entityId: string;
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    }[]
  ): Promise<void>;
  deleteApiKey(id: string): Promise<{
    id: string;
    createdAt: Date;
    createdByUserId: string;
    tenantId: string;
    key: string;
    alias: string;
    expires: Date | null;
    active: boolean;
  }>;
  countTenantApiKeyLogs(tenantId: string): Promise<number>;
}
