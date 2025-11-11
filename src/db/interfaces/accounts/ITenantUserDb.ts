import { TenantUserWithUserDto } from "@/db/models/accounts/TenantsModel";
export interface ITenantUserDb {
  getAll(tenantId: string): Promise<TenantUserWithUserDto[]>;
  get({ tenantId, userId }: { tenantId: string; userId: string }): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string;
    userId: string;
    type: number;
    joined: number;
    status: number;
  } | null>;
  getById(id: string): Promise<TenantUserWithUserDto | null>;
  count(tenantId: string): Promise<number>;
  countByCreatedAt(
    tenantId: string,
    createdAt: {
      gte: Date;
      lt: Date;
    }
  ): Promise<number>;
  create(data: { tenantId: string; userId: string; type: number; joined: number; status: number }): Promise<string>;
  del(id: string): Promise<void>;
}
