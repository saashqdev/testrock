import { Prisma, Tenant, Role } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import { ITenantsDb } from "@/db/interfaces/accounts/ITenantsDb";
import { TenantWithDetailsDto, TenantDto, TenantWithUsageDto, TenantUserWithDetailsDto, TenantUserWithUserDto } from "@/db/models";
import { PaginationRequestDto, PaginationDto } from "@/lib/dtos/PaginationDto";
import RowFiltersHelper from "@/lib/helpers/RowFiltersHelper";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import TenantModelHelper from "@/lib/helpers/models/TenantModelHelper";
import { TenantUserJoined } from "@/lib/enums/tenants/TenantUserJoined";
import { TenantUserStatus } from "@/lib/enums/tenants/TenantUserStatus";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
import RowModelHelper from "@/lib/helpers/models/RowModelHelper";
import { getAvailableTenantInboundAddress } from "@/lib/services/emailService";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import TenantSubscriptionProductModelHelper from "@/lib/helpers/models/TenantSubscriptionProductModelHelper";
import { getAvailableTenantSlug } from "@/lib/services/tenantService";

export class TenantsDbPrisma implements ITenantsDb {
  async getTenantsInIds(ids: string[]): Promise<TenantWithDetailsDto[]> {
    return await prisma.tenant.findMany({
      where: { id: { in: ids } },
      include: {
        ...TenantModelHelper.includeTenantWithDetails,
        users: {
          include: {
            user: {
              include: {
                admin: true,
                roles: { include: { role: true } },
              },
            },
          },
        },
      },
    });
  }

  async adminGetAllTenants(): Promise<TenantWithDetailsDto[]> {
    return await prisma.tenant.findMany({
      include: {
        ...TenantModelHelper.includeTenantWithDetails,
        users: {
          include: {
            user: {
              include: {
                admin: true,
                roles: { include: { role: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async adminGetAllTenantsIdsAndNames(): Promise<{ id: string; name: string; slug: string }[]> {
    return await prisma.tenant.findMany({
      select: { id: true, name: true, slug: true },
    });
  }

  async adminGetAllTenantsWithUsage(
    filters?: FiltersDto,
    pagination?: { page: number; pageSize: number }
  ): Promise<{ items: TenantWithUsageDto[]; pagination: PaginationDto }> {
    let where: Prisma.TenantWhereInput = RowFiltersHelper.getFiltersCondition(filters);
    const userId = filters?.properties.find((f) => f.name === "userId")?.value ?? filters?.query ?? "";
    if (userId) {
      if (where) {
        where = {
          OR: [where, { users: { some: { userId } } }],
        };
      } else {
        where = { users: { some: { userId } } };
      }
    }
    const typeId = filters?.properties.find((f) => f.name === "typeId")?.value;
    if (typeId) {
      if (where) {
        if (typeId === "null") {
          where = {
            OR: [where, { types: { none: {} } }],
          };
        } else {
          where = {
            OR: [where, { types: { some: { id: typeId } } }],
          };
        }
      } else {
        if (typeId === "null") {
          where = { types: { none: {} } };
        } else {
          where = { types: { some: { id: typeId } } };
        }
      }
    }
    const itemsRaw = await prisma.tenant.findMany({
      skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
      take: pagination ? pagination?.pageSize : undefined,
      where,
      include: {
        inboundAddresses: true,
        users: {
          include: {
            user: {
              include: {
                admin: true,
                roles: { include: { role: true } },
                // Add any other fields required by UserDto here
              },
            },
          },
        },
        subscription: {
          include: {
            products: { include: { ...TenantSubscriptionProductModelHelper.includeTenantSubscriptionProductDetails } },
          },
        },
        tenantSettingsRow: {
          include: {
            row: {
              include: {
                ...RowModelHelper.includeRowDetails,
                tenant: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    icon: true,
                    deactivatedReason: true,
                    active: true,
                    types: true,
                    createdAt: true,
                    updatedAt: true,
                    subscriptionId: true,
                  },
                },
              },
            },
          },
        },
        types: true,
        _count: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    // Map users to ensure all required fields for TenantWithUsageDto are present, including _count
    const items: TenantWithUsageDto[] = itemsRaw.map((tenant: any) => ({
      ...tenant,
      users: tenant.users.map((u: any) => ({
        ...u,
        id: u.id,
        createdAt: u.createdAt,
        userId: u.userId,
        tenantId: u.tenantId,
        type: u.type,
        status: u.status,
        joined: u.joined,
        user: {
          ...u.user,
          admin: u.user.admin,
          defaultTenant: u.user.defaultTenant,
          avatar: u.user.avatar,
          roles: u.user.roles,
        },
      })),
      _count: tenant._count ?? {},
    }));
    const totalItems = await prisma.tenant.count({
      where,
    });
    return {
      items,
      pagination: {
        page: pagination?.page ?? 1,
        pageSize: pagination?.pageSize ?? 10,
        totalItems,
        totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? 10)),
      },
    };
  }

  async getTenant(id: string): Promise<TenantWithDetailsDto | null> {
    return await cachified({
      key: `tenant:${id}`,
      ttl: 1000 * 60 * 60 * 24,
      getFreshValue: () =>
        prisma.tenant.findUnique({
          where: {
            id,
          },
          include: {
            ...TenantModelHelper.includeTenantWithDetails,
            users: {
              include: {
                user: {
                  include: {
                    admin: true,
                    roles: { include: { role: true } },
                  },
                },
              },
            },
          },
        }),
    });
  }

  async getTenantDto(id: string): Promise<TenantDto | null> {
    return await cachified({
      key: `tenantSimple:${id}`,
      ttl: 1000 * 60 * 60 * 24,
      getFreshValue: () =>
        prisma.tenant.findUnique({
          where: { id },
          select: TenantModelHelper.selectSimpleTenantProperties,
        }),
    });
  }

  async getTenantByIdOrSlug(id: string) {
    return await cachified({
      key: `tenantIdOrSlug:${id}`,
      ttl: 1000 * 60 * 60 * 24,
      getFreshValue: () =>
        prisma.tenant.findFirst({
          where: {
            OR: [{ id }, { slug: id }],
          },
          include: {
            subscription: true,
          },
        }),
    });
  }

  async getTenantBySlug(slug: string) {
    return await prisma.tenant.findUnique({
      where: {
        slug,
      },
    });
  }

  async getTenantWithUsers(id?: string) {
    if (!id) {
      return null;
    }
    return await prisma.tenant.findUnique({
      where: {
        id,
      },
      include: {
        users: true,
      },
    });
  }

  async getMyTenants(userId: string): Promise<TenantDto[]> {
    const tenantsAsMember = await prisma.tenant.findMany({
      where: { users: { some: { userId } } },
      select: TenantModelHelper.selectSimpleTenantProperties,
      orderBy: { name: "asc" },
    });

    // await Promise.all(tenantsAsMember.map(async(tenant) => {
    //   const relatedTenants = await prisma.tenantRelationship.findFirst({
    //     where: { fromTenantId: tenant.id },
    //     include: { toTenant: true },
    //   });
    // }));

    return [...tenantsAsMember];
  }

  async getTenantUsersCount(tenantId: string) {
    return await prisma.tenantUser.count({
      where: { tenantId },
    });
  }

  async getTenantUsers(tenantId?: string | null): Promise<TenantUserWithUserDto[]> {
    if (!tenantId) {
      return [];
    }
    return await prisma.tenantUser.findMany({
      where: {
        tenantId,
      },
      include: {
        user: {
          include: {
            admin: true,
            roles: { include: { role: true } },
          },
        },
      },
    });
  }

  async getTenantUsersInTenantIds(tenantIds: string[]): Promise<TenantUserWithDetailsDto[]> {
    return await prisma.tenantUser.findMany({
      where: {
        tenantId: { in: tenantIds },
      },
      include: {
        tenant: true,
        user: { select: UserModelHelper.selectSimpleUserProperties, include: { admin: true, roles: { include: { role: true } } } },
      },
    });
  }

  async getAllTenantUsers(): Promise<TenantUserWithUserDto[]> {
    return await prisma.tenantUser.findMany({
      include: {
        user: {
          include: {
            admin: true,
            roles: { include: { role: true } },
          },
        },
      },
    });
  }

  async getTenantUser(id?: string) {
    if (!id) {
      return null;
    }
    return await prisma.tenantUser.findUnique({
      where: {
        id,
      },
      include: {
        tenant: true,
        user: true,
      },
    });
  }

  async getTenantUserByIds(tenantId: string, userId: string) {
    return await prisma.tenantUser.findFirst({
      where: {
        tenantId,
        userId,
      },
      include: {
        tenant: true,
        user: true,
      },
    });
  }

  async getTenantMember(userId?: string, tenantId?: string) {
    return await prisma.tenantUser.findFirst({
      where: {
        userId,
        tenantId,
      },
      include: {
        tenant: true,
        user: true,
      },
    });
  }

  async getTenantUserType(userId: string, tenantId: string) {
    return await prisma.tenantUser.findFirst({
      where: {
        userId,
        tenantId,
      },
      select: { type: true },
    });
  }

  async updateTenant(before: Tenant, data: { name?: string; icon?: string; slug?: string; typeIds?: string[] }) {
    const update: Prisma.TenantUncheckedUpdateInput = {
      name: data.name,
      icon: data.icon,
      slug: data.slug,
    };
    if (data.typeIds) {
      update.types = { set: data.typeIds.map((type) => ({ id: type })) };
    }
    return await prisma.tenant
      .update({
        where: {
          id: before.id,
        },
        data: update,
      })
      .then((item) => {
        clearCacheKey(`tenant:${before.slug}`);
        clearCacheKey(`tenant:${before.id}`);
        clearCacheKey(`tenantIdOrSlug:${before.id}`);
        clearCacheKey(`tenantIdOrSlug:${before.slug}`);
        clearCacheKey(`tenantSimple:${before.id}`);
        return item;
      });
  }

  async addTenantTypeToTenant(id: string, data: { typeId: string }) {
    return await prisma.tenant
      .update({
        where: { id },
        data: { types: { connect: { id: data.typeId } } },
      })
      .then((item) => {
        clearCacheKey(`tenant:${item.slug}`);
        clearCacheKey(`tenant:${item.id}`);
        clearCacheKey(`tenantSimple:${item.id}`);
        return item;
      });
  }

  async updateTenantUser(id: string, data: { type: number }) {
    return await prisma.tenantUser.update({
      where: {
        id,
      },
      data,
    });
  }

  async createTenant({
    name,
    icon,
    subscriptionCustomerId,
    active,
    slug,
  }: {
    name: string;
    icon?: string | null;
    subscriptionCustomerId?: string | undefined;
    active?: boolean;
    slug?: string;
  }) {
    slug = await getAvailableTenantSlug({ name, slug });
    const inboundAddress = await getAvailableTenantInboundAddress(name);
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        icon,
        active,
        inboundAddresses: {
          create: [{ address: inboundAddress }],
        },
      },
    });

    if (subscriptionCustomerId) {
      await db?.tenantSubscriptions.createTenantSubscription(tenant.id, subscriptionCustomerId);
    }

    return tenant;
  }

  async createTenantUser(data: { tenantId: string; userId: string; type: number }, roles: Role[]) {
    const tenantUser = await prisma.tenantUser.create({
      data: {
        ...data,
        joined: TenantUserJoined.JOINED_BY_INVITATION,
        status: TenantUserStatus.ACTIVE,
      },
    });

    await Promise.all(
      roles.map(async (role) => {
        return await db.userRoles.createUserRole(tenantUser.userId, role.id, tenantUser.tenantId);
      })
    );

    return tenantUser;
  }

  async deleteTenantUser(id: string) {
    return await prisma.tenantUser.delete({
      where: {
        id,
      },
    });
  }

  async deleteTenant(id: string): Promise<Tenant> {
    return await prisma.tenant.delete({
      where: {
        id,
      },
      include: {
        subscription: true,
        users: true,
        invitations: true,
        rows: true,
        logs: true,
        apiKeys: true,
        userRoles: true,
      },
    });
  }

  async updateTenantDeactivated(id: string, data: { active: boolean; deactivatedReason: string | null }) {
    return await prisma.tenant
      .update({
        where: {
          id,
        },
        data,
      })
      .then((item) => {
        clearCacheKey(`tenant:${item.slug}`);
        clearCacheKey(`tenant:${item.id}`);
        clearCacheKey(`tenantIdOrSlug:${item.id}`);
        clearCacheKey(`tenantIdOrSlug:${item.slug}`);
        clearCacheKey(`tenantSimple:${item.id}`);
        return item;
      });
  }

  async getAllTenantsWithoutTypes() {
    return await prisma.tenant.findMany({
      where: { types: { none: {} } },
    });
  }

  async countBySlug(slug: string): Promise<number> {
    return await prisma.tenant.count({
      where: { slug },
    });
  }
  async count(): Promise<number> {
    return await prisma.tenant.count();
  }

  async getAll(): Promise<TenantWithDetailsDto[]> {
    return await prisma.tenant.findMany({
      include: {
        ...TenantModelHelper.includeTenantWithDetails,
        users: {
          include: {
            user: {
              include: {
                admin: true,
                roles: { include: { role: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllWithPagination({
    filters,
    pagination,
  }: {
    filters?: { name?: string; slug?: string; active?: boolean };
    pagination?: PaginationRequestDto;
  }): Promise<{ items: TenantWithDetailsDto[]; pagination: PaginationDto }> {
    let where: Prisma.TenantWhereInput = {};
    if (filters?.name) {
      where = { AND: [where, { name: { contains: filters.name, mode: "insensitive" } }] };
    }
    if (filters?.slug) {
      where = { AND: [where, { slug: { contains: filters.slug } }] };
    }
    if (filters?.active !== undefined) {
      where = { AND: [where, { active: filters.active }] };
    }
    const itemsRaw = await prisma.tenant.findMany({
      skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
      take: pagination ? pagination?.pageSize : undefined,
      where,
      include: {
        ...TenantModelHelper.includeTenantWithDetails,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const items: TenantWithDetailsDto[] = itemsRaw.map((tenant: any) => ({
      ...tenant,
      users:
        tenant.users?.map((u: any) => ({
          id: u.id,
          createdAt: u.createdAt,
          tenantId: u.tenantId,
          userId: u.userId,
          type: u.type,
          joined: u.joined,
          status: u.status,
          user: {
            ...u.user,
            admin: u.user.admin,
            defaultTenantId: u.user.defaultTenantId ?? (u.user.defaultTenant ? u.user.defaultTenant.id : null),
            avatar: u.user.avatar,
            roles: u.user.roles,
          },
        })) ?? [],
    }));
    const totalItems = await prisma.tenant.count({
      where,
    });
    return {
      items,
      pagination: {
        page: pagination?.page ?? 1,
        pageSize: pagination?.pageSize ?? 10,
        totalItems,
        totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? 10)),
      },
    };
  }

  async countCreatedSince(since: Date | undefined): Promise<number> {
    return await prisma.tenant.count({
      where: { createdAt: { gte: since } },
    });
  }
}
