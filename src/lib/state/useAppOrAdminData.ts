"use client"

import { useContext } from "react";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import { UserWithoutPasswordDto } from "@/db/models/accounts/UsersModel";
import { AppDataContext } from "./useAppData";
import { AdminDataContext } from "./useAdminData";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { GroupWithDetailsDto } from "@/db/models/permissions/GroupsModel";
import { OnboardingSessionWithDetailsDto } from "@/db/models/onboarding/OnboardingSessionsModel";
import { DefaultPermission } from "@/lib/dtos/shared/DefaultPermissions";
import { EntityGroupWithDetailsDto } from "@/db/models/entityBuilder/EntityGroupsModel";
import { TenantTypeWithDetailsDto } from "@/db/models/accounts/TenantTypesModel";
import { PlanFeatureUsageDto } from "@/lib/dtos/subscriptions/PlanFeatureUsageDto";
import { UserRoleWithPermissionDto } from "@/db/models/permissions/UserRolesModel";

export type AppOrAdminData = {
  // i18n: Record<string, Language>;
  user: UserWithoutPasswordDto;
  myTenants: TenantDto[];
  currentTenant: TenantDto | null;
  allRoles: { id: string; name: string; description: string }[];
  roles: UserRoleWithPermissionDto[];
  permissions: DefaultPermission[];
  entities: EntityWithDetailsDto[];
  entityGroups: EntityGroupWithDetailsDto[];
  isSuperUser: boolean;
  isSuperAdmin: boolean;
  myGroups: GroupWithDetailsDto[];
  lng?: string;
  onboardingSession: OnboardingSessionWithDetailsDto | null;
  tenantTypes: TenantTypeWithDetailsDto[];
  credits?: PlanFeatureUsageDto | undefined;
};

export function useAppOrAdminData(): AppOrAdminData | null {
  // Try to get data from app context first
  const appData = useContext(AppDataContext);

  // If app data is not available, try admin context
  const adminData = useContext(AdminDataContext);

  // Return the available data, preferring app data if both are available
  const data = appData || adminData;

  if (!data) {
    // Return null instead of throwing an error to allow graceful fallback
    return null;
  }

  return data;
}
