import { TenantWithDetailsDto, TenantWithUsageDto, TenantUserWithUserDto, TenantUserWithDetailsDto, TenantDto } from "@/db/models";
import { PaginationRequestDto, PaginationDto } from "@/lib/dtos/PaginationDto";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";

export interface ITenantsDb {
  getTenantsInIds(ids: string[]): Promise<TenantWithDetailsDto[]>;
  adminGetAllTenants(): Promise<TenantWithDetailsDto[]>;
  adminGetAllTenantsIdsAndNames(): Promise<
    {
      id: string;
      name: string;
      slug: string;
    }[]
  >;
  adminGetAllTenantsWithUsage(
    filters?: FiltersDto | undefined,
    pagination?: {
      page: number;
      pageSize: number;
    }
  ): Promise<{
    items: TenantWithUsageDto[];
    pagination: PaginationDto;
  }>;
  getTenant(id: string): Promise<TenantWithDetailsDto | null>;
  getTenantDto(id: string): Promise<TenantDto | null>;
  getTenantByIdOrSlug(id: string): Promise<
    | ({
        subscription: {
          id: string;
          tenantId: string;
          stripeCustomerId: string | null;
        } | null;
      } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        icon: string | null;
        subscriptionId: string | null;
        active: boolean;
        deactivatedReason: string | null;
      })
    | null
  >;
  getTenantBySlug(slug: string): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    icon: string | null;
    subscriptionId: string | null;
    active: boolean;
    deactivatedReason: string | null;
  } | null>;
  getTenantWithUsers(id?: string | undefined): Promise<
    | ({
        users: {
          id: string;
          createdAt: Date;
          tenantId: string;
          userId: string;
          type: number;
          joined: number;
          status: number;
        }[];
      } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        icon: string | null;
        subscriptionId: string | null;
        active: boolean;
        deactivatedReason: string | null;
      })
    | null
  >;
  getMyTenants(userId: string): Promise<TenantDto[]>;
  getTenantUsersCount(tenantId: string): Promise<number>;
  getTenantUsers(tenantId?: string | null | undefined): Promise<TenantUserWithUserDto[]>;
  getTenantUsersInTenantIds(tenantIds: string[]): Promise<TenantUserWithDetailsDto[]>;
  getAllTenantUsers(): Promise<TenantUserWithUserDto[]>;
  getTenantUser(id?: string | undefined): Promise<
    | ({
        tenant: {
          name: string;
          id: string;
          createdAt: Date;
          updatedAt: Date;
          slug: string;
          icon: string | null;
          subscriptionId: string | null;
          active: boolean;
          deactivatedReason: string | null;
        };
        user: {
          id: string;
          createdAt: Date;
          updatedAt: Date;
          active: boolean;
          email: string;
          passwordHash: string;
          firstName: string;
          lastName: string;
          avatar: string | null;
          phone: string | null;
          defaultTenantId: string | null;
          verifyToken: string | null;
          githubId: string | null;
          googleId: string | null;
          locale: string | null;
        };
      } & {})
    | null
  >;
  getTenantUserByIds(
    tenantId: string,
    userId: string
  ): Promise<
    | ({
        tenant: {
          name: string;
          id: string;
          createdAt: Date;
          updatedAt: Date;
          slug: string;
          icon: string | null;
          subscriptionId: string | null;
          active: boolean;
          deactivatedReason: string | null;
        };
        user: {
          id: string;
          createdAt: Date;
          updatedAt: Date;
          active: boolean;
          email: string;
          passwordHash: string;
          firstName: string;
          lastName: string;
          avatar: string | null;
          phone: string | null;
          defaultTenantId: string | null;
          verifyToken: string | null;
          githubId: string | null;
          googleId: string | null;
          locale: string | null;
        };
      } & {})
    | null
  >;
  getTenantMember(
    userId?: string | undefined,
    tenantId?: string | undefined
  ): Promise<
    | ({
        tenant: {
          name: string;
          id: string;
          createdAt: Date;
          updatedAt: Date;
          slug: string;
          icon: string | null;
          subscriptionId: string | null;
          active: boolean;
          deactivatedReason: string | null;
        };
        user: {
          id: string;
          createdAt: Date;
          updatedAt: Date;
          active: boolean;
          email: string;
          passwordHash: string;
          firstName: string;
          lastName: string;
          avatar: string | null;
          phone: string | null;
          defaultTenantId: string | null;
          verifyToken: string | null;
          githubId: string | null;
          googleId: string | null;
          locale: string | null;
        };
      } & {})
    | null
  >;
  getTenantUserType(
    userId: string,
    tenantId: string
  ): Promise<{
    type: number;
  } | null>;
  updateTenant(
    before: {
      name: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      slug: string;
      icon: string | null;
      subscriptionId: string | null;
      active: boolean;
      deactivatedReason: string | null;
    },
    data: {
      name?: string | undefined;
      icon?: string | undefined;
      slug?: string | undefined;
      typeIds?: string[] | undefined;
    }
  ): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    icon: string | null;
    subscriptionId: string | null;
    active: boolean;
    deactivatedReason: string | null;
  }>;
  addTenantTypeToTenant(
    id: string,
    data: {
      typeId: string;
    }
  ): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    icon: string | null;
    subscriptionId: string | null;
    active: boolean;
    deactivatedReason: string | null;
  }>;
  updateTenantUser(
    id: string,
    data: {
      type: number;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string;
    userId: string;
    type: number;
    joined: number;
    status: number;
  }>;
  createTenant({
    name,
    icon,
    subscriptionCustomerId,
    active,
    slug,
  }: {
    name: string;
    icon?: string | null | undefined;
    subscriptionCustomerId?: string | undefined;
    active?: boolean | undefined;
    slug?: string | undefined;
  }): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    icon: string | null;
    subscriptionId: string | null;
    active: boolean;
    deactivatedReason: string | null;
  }>;
  createTenantUser(
    data: {
      tenantId: string;
      userId: string;
      type: number;
    },
    roles: {
      name: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      type: string;
      description: string;
      isDefault: boolean;
      order: number;
      assignToNewUsers: boolean;
    }[]
  ): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string;
    userId: string;
    type: number;
    joined: number;
    status: number;
  }>;
  deleteTenantUser(id: string): Promise<{
    id: string;
    createdAt: Date;
    tenantId: string;
    userId: string;
    type: number;
    joined: number;
    status: number;
  }>;
  deleteTenant(id: string): Promise<{
    slug: string;
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    icon: string | null;
    subscriptionId: string | null;
    active: boolean;
    deactivatedReason: string | null;
  }>;
  updateTenantDeactivated(
    id: string,
    data: {
      active: boolean;
      deactivatedReason: string | null;
    }
  ): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    icon: string | null;
    subscriptionId: string | null;
    active: boolean;
    deactivatedReason: string | null;
  }>;
  getAllTenantsWithoutTypes(): Promise<
    {
      name: string;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      slug: string;
      icon: string | null;
      subscriptionId: string | null;
      active: boolean;
      deactivatedReason: string | null;
    }[]
  >;
  countBySlug(slug: string): Promise<number>;
  count(): Promise<number>;
  getAll(): Promise<TenantWithDetailsDto[]>;
  getAllWithPagination({
    filters,
    pagination,
  }: {
    filters?:
      | {
          name?: string | undefined;
          slug?: string | undefined;
          active?: boolean | undefined;
        }
      | undefined;
    pagination?: PaginationRequestDto | undefined;
  }): Promise<{
    items: TenantWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  countCreatedSince(since: Date | undefined): Promise<number>;
}
