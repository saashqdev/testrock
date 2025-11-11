"use client"

import { createContext, useContext } from "react";
import { TenantUserWithUserDto } from "@/db/models/accounts/TenantsModel";
import { RoleWithPermissionsDto, PermissionsModel, TenantUserInvitationsModel } from "@/db/models";

export type MembersLoaderData = {
  users: TenantUserWithUserDto[];
  pendingInvitations: TenantUserInvitationsModel[];
  roles: RoleWithPermissionsDto[];
  permissions: PermissionsModel[];
  appUrl: string;
};

export type MembersDataDto = MembersLoaderData;

export const MembersDataContext = createContext<MembersDataDto | null>(null);

export default function useMembersData(): MembersDataDto {
  const context = useContext(MembersDataContext);
  
  if (typeof window === 'undefined') {
    throw new Error("useMembersData cannot be used during SSR");
  }
  
  if (!context) {
    throw new Error("useMembersData must be used within a MembersDataContext.Provider");
  }
  return context;
}

// Named export for consistency
export { useMembersData };

