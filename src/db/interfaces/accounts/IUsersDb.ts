import { UserWithoutPasswordDto, UserWithNamesDto, UserWithDetailsDto, UsersModel } from "@/db/models";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationDto, SortedByDto } from "@/lib/dtos/PaginationDto";

export interface IUsersDb {
  adminGetAllTenantUsers(tenantId: string): Promise<UserWithDetailsDto[]>;
  adminGetAllUsers(
    filters?: FiltersDto,
    pagination?: { page: number; pageSize: number; sortedBy?: SortedByDto[] }
  ): Promise<{ items: UserWithDetailsDto[]; pagination: PaginationDto }>;
  adminGetAllUsersNames(): Promise<UserWithNamesDto[]>;
  adminGetAllUsersNamesInIds(ids: string[]): Promise<UserWithNamesDto[]>;
  getUsersById(ids: string[]): Promise<UserWithDetailsDto[]>;
  getAdminUsersInRoles(roles: string[]): Promise<UserWithDetailsDto[]>;
  getUsersByTenant(tenantId: string | null): Promise<UserWithDetailsDto[]>;
  getUser(userId?: string): Promise<UserWithoutPasswordDto | null>;
  getUserByEmail(email?: string): Promise<UserWithoutPasswordDto | null>;
  getUserByUsername(username?: string): Promise<UserWithoutPasswordDto | null>;
  getUserByEmailWithDetails(email: string): Promise<UserWithDetailsDto | null>;
  getUserByGoogleID(googleId: string): Promise<UserWithoutPasswordDto | null>;
  getUserByGitHubID(githubId: string): Promise<UserWithoutPasswordDto | null>;
  register(data: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    active?: boolean;
    githubId?: string;
    googleId?: string;
    avatarURL?: string;
    locale?: string;
    defaultTenantId?: string | null;
    request: Request;
  }): Promise<UserWithoutPasswordDto>;
  updateUserProfile(data: { firstName?: string; lastName?: string; avatar?: string; locale?: string }, userId?: string): Promise<UserWithoutPasswordDto | null>;
  updateUserVerifyToken(data: { verifyToken: string }, userId?: string): Promise<void>;
  updateUserPassword(data: { passwordHash: string }, userId?: string): Promise<void>;
  updateUserDefaultTenantId(data: { defaultTenantId: string }, userId: string): Promise<void>;
  setUserGitHubAccount(data: { githubId: string }, userId: string): Promise<void>;
  setUserGoogleAccount(data: { googleId: string }, userId: string): Promise<void>;
  deleteUser(userId: string): Promise<UserWithoutPasswordDto | null>;
  getPasswordHash(id: string): Promise<string | null>;
  getVerifyToken(id: string): Promise<string | null>;
  count(): Promise<number>;
  getAll(): Promise<UserWithDetailsDto[]>;
  getAllWithPagination({
    filters,
    pagination,
  }: {
    filters: {
      email?: string | undefined;
      firstName?: string | undefined;
      lastName?: string | undefined;
      tenantId?: string | null | undefined;
      admin?: boolean | undefined;
    };
    pagination: {
      page: number;
      pageSize: number;
      sortedBy?: SortedByDto[] | undefined;
    };
  }): Promise<{
    items: UserWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  create(data: UsersModel): Promise<string>;
  update(
    id: string,
    data: {
      firstName?: string | undefined;
      lastName?: string | undefined;
      avatar?: string | null | undefined;
      locale?: string | null | undefined;
      verifyToken?: string | null | undefined;
      passwordHash?: string | undefined;
      defaultTenantId?: string | null | undefined;
      admin?: boolean | undefined;
    }
  ): Promise<void>;
}
