import { TenantIpAddressWithDetailsDto } from "@/db/models/accounts/TenantIpAddressModel";
import { PaginationDto } from "@/lib/dtos/PaginationDto";

export interface ITenantIpAddressDb {
  getAllTenantIpAddresses(
    pagination?:
      | {
          page: number;
          pageSize: number;
        }
      | undefined
  ): Promise<{
    items: TenantIpAddressWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  createUniqueTenantIpAddress(data: {
    ip: string;
    fromUrl: string;
    tenantId: string;
    userId?: string | null | undefined;
    apiKeyId?: string | null | undefined;
  }): Promise<void>;
}
