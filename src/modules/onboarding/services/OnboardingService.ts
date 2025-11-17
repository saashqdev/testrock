import { OnboardingFilter, OnboardingSession } from "@prisma/client";
import { UserDto } from "@/db/models/accounts/UsersModel";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { OnboardingSessionWithDetailsDto } from "@/db/models/onboarding/OnboardingSessionsModel";
import { OnboardingCandidateDto } from "../dtos/OnboardingCandidateDto";
import { OnboardingFilterMetadataDto } from "../dtos/OnboardingFilterMetadataDto";
import { OnboardingFilterType } from "../dtos/OnboardingFilterTypes";
import OnboardingFiltersService from "./OnboardingFiltersService";
import OnboardingSessionService from "./OnboardingSessionService";
import { db } from "@/db";

async function getUserActiveOnboarding({
  userId,
  tenantId,
  request,
}: {
  userId: string;
  tenantId: string | null;
  request: Request;
}): Promise<OnboardingSessionWithDetailsDto | null> {
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.onboarding.enabled) {
    return null;
  }
  let currentSession: OnboardingSessionWithDetailsDto | null = null;

  const allUserOnboardings = await db.onboardingSessions.getOnboardingSessionsByUser({ userId, tenantId });
  const activeOnboardings = allUserOnboardings.filter((f) => f.status === "active" || f.status === "started");
  // If there is an active onboarding, return it
  if (activeOnboardings.length > 0) {
    currentSession = activeOnboardings[0];
    if (currentSession.status === "active") {
      await OnboardingSessionService.started({ session: currentSession, request });
    }
  }
  // If there is no active onboarding, check if this user belongs to an active onboarding
  else {
    const onboardingSessions = await generateMatchingOnboardings({ userId, tenantId });
    await Promise.all(
      onboardingSessions.map(async (session) => {
        if (!currentSession && (session?.status === "active" || session?.status === "started")) {
          currentSession = await db.onboardingSessions.getOnboardingSession(session.id);
          if (currentSession && currentSession.status === "active") {
            await OnboardingSessionService.started({ session: currentSession, request });
          }
        }
      })
    );
  }

  if (!currentSession?.onboarding.active) {
    return null;
  }
  return currentSession;
}

async function generateMatchingOnboardings({ userId, tenantId }: { userId: string; tenantId: string | null }): Promise<(OnboardingSession | undefined)[]> {
  const allOnboardings = await db.onboarding.getOnboardings({
    realtime: true,
    active: true,
  });
  return await Promise.all(
    allOnboardings.map(async (onboarding) => {
      const existingSession = onboarding.sessions.find((f) => f.userId === userId);
      if (existingSession) {
        return;
      }
      if (onboarding.filters.length === 0) {
        return;
      }
      const matchingFilters = await getMatchingFilters({ userId, tenantId, filters: onboarding.filters });
      if (matchingFilters.length === onboarding.filters.length) {
        return await db.onboarding.createOnboardingSession(onboarding, {
          userId,
          tenantId,
          status: "active",
          matchingFilters,
          createdRealtime: true,
        });
      }
    })
  );
}

async function getMatchingFilters({
  userId,
  tenantId,
  filters,
}: {
  userId: string;
  tenantId: string | null;
  filters: OnboardingFilter[];
}): Promise<OnboardingFilter[]> {
  const matchedFilters: OnboardingFilter[] = [];
  await Promise.all(
    filters.map(async (filter) => {
      if (await OnboardingFiltersService.matches({ userId, tenantId, filter })) {
        matchedFilters.push(filter);
      }
    })
  );
  return matchedFilters;
}

async function setOnboardingStatus(id: string, active: boolean): Promise<void> {
  const onboarding = await db.onboarding.getOnboarding(id);
  if (!onboarding || onboarding.active === active) {
    return;
  }
  await db.onboarding.updateOnboarding(id, { active });
  // await updateOnboardingSessions(
  //   onboarding.sessions.map((m) => m.id),
  //   { status: "active" }
  // );
}

async function getCandidates(onboarding: OnboardingWithDetailsDto): Promise<OnboardingCandidateDto[]> {
  if (onboarding.filters.length === 0) {
    return [];
  }
  const candidates: OnboardingCandidateDto[] = [];
  const allUsers = await db.users.adminGetAllUsers();
  const allTenantUsers = await db.tenants.getAllTenantUsers();
  const allTenants = await db.tenants.adminGetAllTenants();
  await Promise.all(
    allUsers.items.map(async (user) => {
      if (!user.admin) {
        return;
      }
      const matchingFilters = await getMatchingFilters({ userId: user.id, tenantId: null, filters: onboarding.filters });
      if (matchingFilters.length === onboarding.filters.length) {
        candidates.push({
          id: `${user.id}-admin`,
          user: user as UserDto,
          tenant: null,
          matchingFilters: matchingFilters.map((m) => {
            return {
              type: m.type as OnboardingFilterType,
              value: m.value,
            };
          }),
        });
      }
    })
  );

  await Promise.all(
    allTenantUsers.map(async (tenantUser) => {
      const tenant = allTenants.find((f) => f.id === tenantUser.tenantId);
      if (!tenant) {
        return;
      }
      const matchingFilters = await getMatchingFilters({ userId: tenantUser.userId, tenantId: tenantUser.tenantId, filters: onboarding.filters });
      if (matchingFilters.length === onboarding.filters.length) {
        candidates.push({
          id: `${tenantUser.userId}-${tenantUser.tenantId}`,
          user: tenantUser.user as UserDto,
          tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
          matchingFilters: matchingFilters.map((m) => {
            return {
              type: m.type as OnboardingFilterType,
              value: m.value,
            };
          }),
        });
      }
    })
  );

  return candidates.sort((a, b) => {
    if (a.tenant && !b.tenant) {
      return 1;
    }
    if (!a.tenant && b.tenant) {
      return -1;
    }
    if (a.tenant && b.tenant) {
      return a.tenant.name.localeCompare(b.tenant.name);
    }
    return a.user.email.localeCompare(b.user.email);
  });
}

async function getMetadata(): Promise<OnboardingFilterMetadataDto> {
  return {
    users: (await db.users.adminGetAllUsers()).items,
    tenants: await db.tenants.adminGetAllTenants(),
    entities: await db.entities.getAllEntities(null),
    subscriptionProducts: await db.subscriptionProducts.getAllSubscriptionProducts(),
    roles: await db.roles.getAllRoles(),
  };
}

export type OnboardingSummaryDto = {
  onboardings: { all: number; active: number };
  sessions: { all: number; active: number; dismissed: number; completed: number };
};
async function getSummary(): Promise<OnboardingSummaryDto> {
  const allOnboardings = await db.onboarding.getOnboardings({});
  const summary: OnboardingSummaryDto = {
    onboardings: { all: 0, active: 0 },
    sessions: { all: 0, active: 0, dismissed: 0, completed: 0 },
  };
  allOnboardings.forEach((onboarding) => {
    summary.onboardings.all++;
    if (onboarding.active) {
      summary.onboardings.active++;
    }
    onboarding.sessions.forEach((session) => {
      summary.sessions.all++;
      if (session.status === "active" || session.status === "started") {
        summary.sessions.active++;
      } else if (session.status === "completed") {
        summary.sessions.completed++;
      } else if (session.status === "dismissed") {
        summary.sessions.dismissed++;
      }
    });
  });
  return summary;
}

export default {
  getUserActiveOnboarding,
  getMatchingFilters,
  setOnboardingStatus,
  getCandidates,
  getMetadata,
  getSummary,
};
