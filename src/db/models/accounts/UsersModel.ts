import { AdminUser, UserRole, Role, Tenant, TenantUser } from "@prisma/client";

export type UsersModel = {
  id: string;
  createdAt: Date;
  active: boolean;
  updatedAt: Date;
  email: string;
  username: string;
  locale: string | null;
  firstName: string;
  lastName: string;
  passwordHash: string;
  avatar: string | null;
  phone: string | null;
  defaultTenantId: string | null;
  verifyToken: string | null;
  githubId: string | null;
  googleId: string | null;
  admin: AdminUser | null;
}

export type UserDto = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  //avatar: string | null;
  phone: string | null;
  githubId: string | null;
  googleId: string | null;
  locale: string | null;
  createdAt: Date;
};

export type UserWithNamesDto = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
};

export type UserWithoutPasswordDto = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  phone: string | null;
  admin?: AdminUser | null;
  defaultTenantId: string | null;
  verifyToken: string | null;
  createdAt: Date;
  githubId: string | null;
  googleId: string | null;
  locale: string | null;
};

export type UserWithRolesDto = UserDto & {
  admin?: AdminUser | null;
  roles: (UserRole & { role: Role })[];
};

export type UserWithDetailsDto = UserWithoutPasswordDto & {
  admin: AdminUser | null;
  tenants: (TenantUser & { tenant: Tenant })[];
  roles: (UserRole & { role: Role })[];
};
