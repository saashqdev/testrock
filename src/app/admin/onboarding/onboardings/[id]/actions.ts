"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { db } from "@/db";
import { OnboardingFilterType } from "@/modules/onboarding/dtos/OnboardingFilterTypes";
import { OnboardingCandidateDto } from "@/modules/onboarding/dtos/OnboardingCandidateDto";

type ActionData = {
  error?: string;
  success?: string;
};

export async function updateOnboarding(itemId: string, formData: FormData): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.onboarding.update");
    const { t } = await getServerTranslations();

    const item = await db.onboarding.getOnboarding(itemId);
    if (!item) {
      redirect("/admin/onboarding/onboardings");
    }

    const title = formData.get("title")?.toString();
    await db.onboarding.updateOnboarding(item.id, {
      title: title !== undefined ? title : undefined,
    });

    revalidatePath(`/admin/onboarding/onboardings/${itemId}`);
    return { success: "Onboarding updated" };
  } catch (error) {
    const { t } = await getServerTranslations();
    return { error: error instanceof Error ? error.message : t("shared.error") };
  }
}

export async function activateOnboarding(itemId: string, active: boolean): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.onboarding.update");
    const { t } = await getServerTranslations();

    const item = await db.onboarding.getOnboarding(itemId);
    if (!item) {
      redirect("/admin/onboarding/onboardings");
    }

    await db.onboarding.updateOnboarding(item.id, {
      active: active,
    });

    revalidatePath(`/admin/onboarding/onboardings/${itemId}`);

    if (active) {
      return { success: "Onboarding activated" };
    } else {
      return { success: "Onboarding deactivated" };
    }
  } catch (error) {
    const { t } = await getServerTranslations();
    return { error: error instanceof Error ? error.message : t("shared.error") };
  }
}

export async function deleteOnboarding(id: string) {
  const { t } = await getServerTranslations();

  try {
    // Verify user has permission to delete
    await verifyUserHasPermission("admin.onboarding.delete");

    // Get the onboarding item
    const item = await db.onboarding.getOnboarding(id);
    if (!item) {
      return { error: t("shared.notFound") };
    }

    // Check if it's active (shouldn't delete active onboardings)
    if (item.active) {
      return { error: "Cannot delete an active onboarding" };
    }

    // Delete the onboarding
    await db.onboarding.deleteOnboarding(item.id);

    // Redirect after successful deletion
    redirect("/admin/onboarding/onboardings");
  } catch (error) {
    console.error("Error deleting onboarding:", error);
    return { error: t("shared.error") || "An error occurred while deleting" };
  }
}

// Server action for updating filters
export async function updateFiltersAction(onboardingId: string, filters: { type: OnboardingFilterType; value: string | null }[]): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.onboarding.update");

    await db.onboarding.updateOnboarding(onboardingId, {
      filters: filters as any,
    });
    return { success: "Onboarding filters updated" };
  } catch (error) {
    console.error("Error updating filters:", error);
    return { error: "Failed to update filters" };
  }
}

// Server action for updating realtime
export async function updateRealtimeAction(onboardingId: string, realtime: boolean): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.onboarding.update");

    await db.onboarding.updateOnboarding(onboardingId, {
      realtime,
    });
    return { success: "Onboarding realtime setting updated" };
  } catch (error) {
    console.error("Error updating realtime:", error);
    return { error: "Failed to update realtime" };
  }
}

// Server action for saving sessions
export async function saveSessionsAction(onboardingId: string, candidates: OnboardingCandidateDto[]): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.onboarding.update");

    const item = await db.onboarding.getOnboarding(onboardingId);
    if (!item) {
      return { error: "Onboarding not found" };
    }

    const existingSessions = await db.onboardingSessions.getOnboardingSessions({
      onboardingId: item.id,
    });

    await Promise.all(
      candidates.map(async (candidate) => {
        const existing = existingSessions.find((f) => f.tenantId === (candidate.tenant?.id ?? null) && f.userId === candidate.user.id);
        if (existing) {
          return;
        }
        await db.onboarding.createOnboardingSession(item, {
          userId: candidate.user.id,
          tenantId: candidate.tenant?.id ?? null,
          status: "active",
          matchingFilters: item.filters,
          createdRealtime: false,
        });
      })
    );
    return { success: "Onboarding sessions manually set" };
  } catch (error) {
    console.error("Error saving sessions:", error);
    return { error: "Failed to save sessions" };
  }
}

// Server action for updating onboarding settings
export async function updateSettingsAction(onboardingId: string, formData: FormData): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.onboarding.update");
    const { t } = await getServerTranslations();

    const item = await db.onboarding.getOnboarding(onboardingId);
    if (!item) {
      redirect("/admin/onboarding/onboardings");
    }

    const title = formData.get("title")?.toString();
    const type = formData.get("type")?.toString();
    const active = formData.get("active");

    await db.onboarding.updateOnboarding(item.id, {
      title: title !== undefined ? title : undefined,
      type: type !== undefined ? (type as "modal" | "page") : undefined,
      active: active !== undefined ? Boolean(active) : undefined,
    });

    revalidatePath(`/admin/onboarding/onboardings/${onboardingId}/settings`);
    return { success: "Onboarding updated" };
  } catch (error) {
    const { t } = await getServerTranslations();
    return { error: error instanceof Error ? error.message : t("shared.error") };
  }
}

// Server action for setting filters
export async function setFiltersAction(onboardingId: string, filters: { type: string; value: string | null }[]): Promise<ActionData> {
  try {
    await verifyUserHasPermission("admin.onboarding.update");

    const item = await db.onboarding.getOnboarding(onboardingId);
    if (!item) {
      redirect("/admin/onboarding/onboardings");
    }

    await db.onboarding.updateOnboarding(item.id, {
      filters: filters as any,
    });

    revalidatePath(`/admin/onboarding/onboardings/${onboardingId}/settings`);
    return { success: "Filters updated" };
  } catch (error) {
    const { t } = await getServerTranslations();
    return { error: error instanceof Error ? error.message : t("shared.error") };
  }
}
