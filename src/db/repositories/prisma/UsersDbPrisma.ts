import { Prisma } from "@prisma/client";
import { IUsersDb } from "@/db/interfaces/accounts/IUsersDb";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { UserWithDetailsDto, UserWithNamesDto, UserWithoutPasswordDto, UsersModel } from "@/db/models/accounts/UsersModel";
import * as Constants from "@/lib/constants";
import { PaginationDto, SortedByDto } from "@/lib/dtos/PaginationDto";
import RowFiltersHelper from "@/lib/helpers/RowFiltersHelper";
import DateUtils from "@/lib/shared/DateUtils";
import { DefaultLogActions } from "@/lib/dtos/shared/DefaultLogActions";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import bcrypt from "bcryptjs";
import CrmService from "@/modules/crm/services/CrmService";
import { ContactStatus } from "@/lib/dtos/crm/ContactStatus";
import { prisma } from "@/db/config/prisma/database";

export class UsersDbPrisma implements IUsersDb {
  async adminGetAllTenantUsers(tenantId: string): Promise<UserWithDetailsDto[]> {
    return prisma.user.findMany({
      where: {
        tenants: {
          some: {
            tenantId,
          },
        },
      },
      include: {
        admin: true,
        tenants: {
          include: {
            tenant: true,
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async adminGetAllUsers(
    filters?: FiltersDto,
    pagination?: { page: number; pageSize: number; sortedBy?: SortedByDto[] }
  ): Promise<{ items: UserWithDetailsDto[]; pagination: PaginationDto }> {
    let where: Prisma.UserWhereInput = RowFiltersHelper.getFiltersCondition(filters);
    const tenantId = filters?.properties.find((f) => f.name === "tenantId")?.value ?? filters?.query ?? "";
    if (tenantId) {
      where = {
        OR: [where, { tenants: { some: { tenantId } } }],
      };
    }
    // lastLogin manual filter
    const lastLoginFilter = filters?.properties.find((f) => f.name === "lastLogin");
    if (lastLoginFilter?.value) {
      const gte = DateUtils.gteFromFilter(lastLoginFilter.value);
      const logs = (
        await prisma.log.findMany({
          where: { userId: { not: null }, createdAt: { gte }, action: DefaultLogActions.Login },
          select: { userId: true },
        })
      ).map((l) => l.userId);
      const usersIn: string[] = logs.filter((f) => f !== null).map((m) => m as string);
      where = {
        AND: [where, { id: { in: usersIn } }],
      };
    }

    const isAdminFilter = filters?.properties.find((f) => f.name === "isAdmin");
    if (isAdminFilter?.value) {
      if (isAdminFilter.value === "true") {
        where = {
          AND: [where, { admin: { isNot: null } }],
        };
      } else {
        where = {
          AND: [where, { admin: null }],
        };
      }
    }

    let orderBy: Prisma.UserOrderByWithRelationInput[] = [{ createdAt: "desc" }];
    if (pagination?.sortedBy?.length) {
      pagination.sortedBy = pagination.sortedBy.filter((s) => ["email", "firstName", "lastName", "createdAt"].includes(s.name));
      orderBy = pagination.sortedBy.map((s) => {
        return { [s.name]: s.direction };
      });
    }
    const items = await prisma.user.findMany({
      skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
      take: pagination ? pagination?.pageSize : undefined,
      where,
      include: {
        admin: true,
        tenants: {
          include: {
            tenant: true,
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy,
    });
    const totalItems = await prisma.user.count({
      where,
    });
    return {
      items,
      pagination: {
        page: pagination?.page ?? 1,
        pageSize: pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE,
        totalItems,
        totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE)),
      },
    };
  }

  async adminGetAllUsersNames(): Promise<UserWithNamesDto[]> {
    return prisma.user.findMany({
      select: { id: true, email: true, username: true, firstName: true, lastName: true },
    });
  }

  async adminGetAllUsersNamesInIds(ids: string[]): Promise<UserWithNamesDto[]> {
    return prisma.user.findMany({
      select: { id: true, email: true, username: true, firstName: true, lastName: true },
      where: {
        id: { in: ids },
      },
    });
  }

  async getUsersById(ids: string[]): Promise<UserWithDetailsDto[]> {
    return prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        admin: true,
        tenants: {
          include: {
            tenant: true,
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async getAdminUsersInRoles(roles: string[]): Promise<UserWithDetailsDto[]> {
    return prisma.user.findMany({
      where: { roles: { some: { role: { id: { in: roles } } } } },
      include: {
        admin: true,
        tenants: {
          include: {
            tenant: true,
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async getUsersByTenant(tenantId: string | null): Promise<UserWithDetailsDto[]> {
    let where = {};
    if (tenantId) {
      where = {
        tenants: {
          some: {
            tenantId,
          },
        },
      };
    } else {
      where = {
        admin: {
          isNot: null,
        },
      };
    }
    return prisma.user.findMany({
      where,
      include: {
        admin: true,
        tenants: {
          include: {
            tenant: true,
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async getUser(userId?: string): Promise<UserWithoutPasswordDto | null> {
    if (!userId) {
      return null;
    }
    try {
      return await cachified({
        key: `user:${userId}`,
        ttl: 1000 * 60 * 60 * 24,
        getFreshValue: async () =>
          prisma.user.findUnique({
            where: { id: userId },
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true,
              admin: true,
              defaultTenantId: true,
              createdAt: true,
              githubId: true,
              googleId: true,
              locale: true,
              verifyToken: true,
            },
          }),
      });
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.log(error.message);
      return null;
    }
  }

  async getUserByEmail(email?: string) {
    if (!email) {
      return null;
    }
    return await prisma.user.findUnique({
      where: { email },
      include: {
        tenants: true,
        admin: true,
      },
    });
  }

  async getUserByUsername(username?: string) {
    if (!username) {
      return null;
    }
    return await prisma.user.findUnique({
      where: { username },
      include: {
        tenants: true,
        admin: true,
      },
    });
  }

  async getUserByEmailWithDetails(email: string): Promise<UserWithDetailsDto | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        admin: true,
        tenants: { include: { tenant: true } },
        roles: { include: { role: true } },
      },
    });
  }

  async getUserByGoogleID(googleId: string) {
    return await prisma.user.findUnique({
      where: { googleId },
      include: {
        tenants: true,
        admin: true,
      },
    });
  }

  async getUserByGitHubID(githubId: string) {
    return await prisma.user.findUnique({
      where: { githubId },
      include: {
        tenants: true,
        admin: true,
      },
    });
  }

  async register(data: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    active?: boolean;
    githubId?: string | null;
    googleId?: string | null;
    avatarURL?: string;
    locale?: string;
    defaultTenantId?: string | null;
    request: Request;
  }) {
    const { email, username, password, firstName, lastName, active, githubId, googleId, avatarURL, locale, defaultTenantId } = data;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        firstName,
        lastName,
        avatar: avatarURL ?? "",
        phone: "",
        active,
        githubId,
        googleId,
        locale,
        defaultTenantId,
      },
    });
    await CrmService.createContact({
      tenantId: null,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      jobTitle: "",
      marketingSubscriber: true,
      status: ContactStatus.Customer,
      request: data.request,
    })
      .then((e) => {
        // eslint-disable-next-line no-console
        console.log("[CrmService] Created user contact", {
          email: user.email,
          e,
        });
      })
      .catch((e) => {
        //
      });
    return {
      id: user.id,
      email,
      username,
      defaultTenantId: "",
      locale: locale ?? null,
      firstName,
      lastName,
      avatar: user.avatar,
      phone: user.phone,
      createdAt: user.createdAt,
      githubId: githubId ?? null,
      googleId: googleId ?? null,
      verifyToken: user.verifyToken ?? "",
    };
  }

  async updateUserProfile(data: { firstName?: string; lastName?: string; avatar?: string; locale?: string }, userId?: string) {
    if (!userId) {
      return null;
    }
    return await prisma.user
      .update({
        where: { id: userId },
        data,
      })
      .then((item) => {
        clearCacheKey(`user:${userId}`);
        return item;
      });
  }

  async updateUserVerifyToken(data: { verifyToken: string }, userId?: string): Promise<void> {
    if (!userId) {
      return;
    }
    await prisma.user.update({
      where: { id: userId },
      data,
    });
    clearCacheKey(`user:${userId}`);
  }

  async updateUserPassword(data: { passwordHash: string }, userId?: string): Promise<void> {
    if (!userId) {
      return;
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        verifyToken: "",
      },
    });
    clearCacheKey(`user:${userId}`);
  }

  async updateUserDefaultTenantId(data: { defaultTenantId: string }, userId: string): Promise<void> {
    if (!userId) {
      return;
    }
    await prisma.user
      .update({
        where: { id: userId },
        data,
      })
      .then((item) => {
        clearCacheKey(`user:${userId}`);
        return item;
      });
  }

  async setUserGitHubAccount(data: { githubId: string }, userId: string): Promise<void> {
    if (!userId) {
      return;
    }
    await prisma.user.update({
      where: { id: userId },
      data,
    });
    clearCacheKey(`user:${userId}`);
  }

  async setUserGoogleAccount(data: { googleId: string }, userId: string): Promise<void> {
    if (!userId) {
      return;
    }
    await prisma.user.update({
      where: { id: userId },
      data,
    });
    clearCacheKey(`user:${userId}`);
  }

  async deleteUser(userId: string) {
    return await prisma.user
      .delete({
        where: { id: userId },
      })
      .then((item) => {
        clearCacheKey(`user:${userId}`);
        return item;
      });
  }

  async getPasswordHash(id: string): Promise<string | null> {
    const item = await prisma.user.findUnique({
      where: { id },
      select: { passwordHash: true },
    });

    return item?.passwordHash ?? null;
  }

  async getVerifyToken(id: string): Promise<string | null> {
    const item = await prisma.user.findUnique({
      where: { id },
      select: { verifyToken: true },
    });

    return item?.verifyToken ?? null;
  }

  async count(): Promise<number> {
    return prisma.user.count();
  }

  async getAll(): Promise<UserWithDetailsDto[]> {
    return await prisma.user.findMany({
      include: {
        admin: true,
        tenants: { include: { tenant: true } },
        roles: { include: { role: true } },
      },
    });
  }

  async getAllWithPagination({
    filters,
    pagination,
  }: {
    filters: { email?: string; firstName?: string; lastName?: string; tenantId?: string | null; admin?: boolean };
    pagination: { page: number; pageSize: number; sortedBy?: SortedByDto[] };
  }): Promise<{ items: UserWithDetailsDto[]; pagination: PaginationDto }> {
    let where: Prisma.UserWhereInput = {};
    if (filters?.email) {
      where.email = { contains: filters.email };
    }
    if (filters?.firstName) {
      where.firstName = { contains: filters.firstName };
    }
    if (filters?.lastName) {
      where.lastName = { contains: filters.lastName };
    }
    if (filters?.tenantId) {
      where = {
        OR: [where, { tenants: { some: { tenantId: filters.tenantId } } }],
      };
    }
    if (filters?.admin !== undefined) {
      where.admin = filters.admin ? { isNot: null } : null;
    }

    let orderBy: Prisma.UserOrderByWithRelationInput[] = [{ createdAt: "desc" }];
    if (pagination?.sortedBy?.length) {
      pagination.sortedBy = pagination.sortedBy.filter((s) => ["email", "firstName", "lastName", "createdAt"].includes(s.name));
      orderBy = pagination.sortedBy.map((s) => {
        return { [s.name]: s.direction };
      });
    }
    const items = await prisma.user.findMany({
      skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
      take: pagination ? pagination?.pageSize : undefined,
      where,
      include: {
        admin: true,
        tenants: {
          include: {
            tenant: true,
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy,
    });
    const totalItems = await prisma.user.count({
      where,
    });
    return {
      items,
      pagination: {
        page: pagination?.page ?? 1,
        pageSize: pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE,
        totalItems,
        totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE)),
      },
    };
  }

  async create(data: UsersModel): Promise<string> {
    const userData: any = {
      id: data.id,
      email: data.email,
      username: data.username,
      passwordHash: data.passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
      phone: data.phone,
      active: data.active,
      locale: data.locale,
      defaultTenantId: data.defaultTenantId,
    };

    // Only include admin field if the user should be an admin
    if (data.admin) {
      userData.admin = {
        create: {
          userId: data.id,
        },
      };
    }

    const item = await prisma.user.create({
      data: userData,
    });
    return item.id;
  }
  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      avatar?: string | null;
      locale?: string | null;
      verifyToken?: string | null;
      passwordHash?: string;
      defaultTenantId?: string | null;
      admin?: boolean;
    }
  ): Promise<void> {
    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatar,
      locale: data.locale,
      verifyToken: data.verifyToken,
      passwordHash: data.passwordHash,
      defaultTenantId: data.defaultTenantId,
    };

    // Handle admin field properly
    if (data.admin !== undefined) {
      if (data.admin) {
        // Create admin record if it doesn't exist
        updateData.admin = {
          upsert: {
            create: { userId: id },
            update: {},
          },
        };
      } else {
        // Remove admin record if it exists
        updateData.admin = {
          delete: true,
        };
      }
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });
  }
}
