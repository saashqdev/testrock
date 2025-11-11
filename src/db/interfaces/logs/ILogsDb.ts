import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { LogWithDetailsDto } from "@/db/models/logs/LogsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { UserWithoutPasswordDto } from "@/db/models/accounts/UsersModel";

export interface ILogsDb {
  getAllLogs(
    pagination: {
      page: number;
      pageSize: number;
    },
    filters: FiltersDto
  ): Promise<{
    items: LogWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  getLogs(
    tenantId: string,
    pagination: {
      page: number;
      pageSize: number;
    },
    filters: FiltersDto
  ): Promise<{
    items: LogWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  getAllRowLogs({
    entityId,
    rowId,
    tenantId,
    pagination,
  }: {
    entityId?: string | undefined;
    rowId?: string | undefined;
    tenantId?: string | null | undefined;
    pagination: {
      page: number;
      pageSize: number;
    };
  }): Promise<{
    items: LogWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  getRowLogs(tenantId: string | null, rowId: string): Promise<LogWithDetailsDto[]>;
  getRowLogsById(rowId: string): Promise<LogWithDetailsDto[]>;
  createLog(request: Request, tenantId: string | null, action: string, details: string): Promise<void>;
  createManualLog(userId: string, tenantId: string | null, pathname: string, action: string, details: string): Promise<void>;
  createRowLog(
    request: Request,
    data: {
      tenantId: string | null;
      createdByUserId?: string | null | undefined;
      createdByApiKey?: string | null | undefined;
      action: string;
      entity: EntityWithDetailsDto;
      item: RowWithDetailsDto | null;
      commentId?: string | null;
      details?: string;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string | null;
    userId: string | null;
    apiKeyId: string | null;
    rowId: string | null;
    url: string;
    action: string;
    details: string | null;
    commentId: string | null;
  }>;
  createManualRowLog(
    data: {
      tenantId: string | null;
      createdByUserId?: string | null | undefined;
      createdByApiKey?: string | null | undefined;
      action: string;
      entity: EntityWithDetailsDto;
      item: RowWithDetailsDto | null;
      commentId?: string | null;
    },
    request?: Request
  ): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string | null;
    userId: string | null;
    apiKeyId: string | null;
    rowId: string | null;
    url: string;
    action: string;
    details: string | null;
    commentId: string | null;
  }>;
  createLogLogin(request: Request, user: UserWithoutPasswordDto): Promise<void>;
  createLogLogout(request: Request, userId: string): Promise<void>;
  createAdminLog(request: Request, action: string, details: string): Promise<void>;
  getLastUserLog(userId: string): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string | null;
    userId: string | null;
    apiKeyId: string | null;
    rowId: string | null;
    url: string;
    action: string;
    details: string | null;
    commentId: string | null;
  } | null>;
}
