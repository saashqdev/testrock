import { PortalUserDto } from "@/modules/portals/dtos/PortalUserDto";

export interface IPortalUsersDb {
  getPortalUserById(portalId: string, id: string): Promise<PortalUserDto | null>;
  getPortalUserByEmail(portalId: string, email: string): Promise<PortalUserDto | null>;
  getPortalUsers(portalId: string): Promise<PortalUserDto[]>;
  createPortalUser(data: {
    tenantId: string | null;
    portalId: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  }): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    tenantId: string | null;
    portalId: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    phone: string | null;
    verifyToken: string | null;
    githubId: string | null;
    googleId: string | null;
    locale: string | null;
  }>;
  updatePortalUser(
    id: string,
    data: {
      email?: string | undefined;
      passwordHash?: string | undefined;
      firstName?: string | undefined;
      lastName?: string | undefined;
      avatar?: string | null | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    phone: string | null;
    verifyToken: string | null;
    githubId: string | null;
    googleId: string | null;
    locale: string | null;
    tenantId: string | null;
    portalId: string;
  }>;
  deletePortalUser(
    portalId: string,
    id: string
  ): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    phone: string | null;
    verifyToken: string | null;
    githubId: string | null;
    googleId: string | null;
    locale: string | null;
    tenantId: string | null;
    portalId: string;
  }>;
  countPortalUsersByTenantId(tenantId: string | null): Promise<number>;
  getPortalUserPasswordHash(id: string): Promise<string | null>;
  updatePortalUserPassword(
    id: string,
    data: {
      passwordHash: string;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    phone: string | null;
    verifyToken: string | null;
    githubId: string | null;
    googleId: string | null;
    locale: string | null;
    tenantId: string | null;
    portalId: string;
  }>;
}
