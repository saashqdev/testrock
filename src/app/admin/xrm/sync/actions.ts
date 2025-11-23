"use server";

import { ContactStatus } from "@/lib/dtos/crm/ContactStatus";
import { requireAuth } from "@/lib/services/loaders.middleware";
import CrmService from "@/modules/crm/services/CrmService";
import { revalidatePath } from "next/cache";

export async function syncAction(formData: FormData): Promise<{ success?: string; error?: string }> {
  try {
    await requireAuth();

    const action = formData.get("action");
    if (action !== "sync") {
      return { error: "Invalid action" };
    }

    const emails = formData.getAll("emails[]").map((x) => x.toString());
    const usersInCrm = await CrmService.getUsersInCrm({ invalidateCache: false });
    let progress: { updated: number; created: number } = { updated: 0, created: 0 };
    let filteredUsers = usersInCrm.filter((x) => emails.includes(x.email));

    for (const userInCrm of filteredUsers) {
      if (userInCrm.status === "to-update" && userInCrm.contact?.id) {
        const changes = await CrmService.updateContact(userInCrm.contact?.id, {
          firstName: userInCrm.firstName ?? "",
          lastName: userInCrm.lastName ?? "",
          marketingSubscriber: true,
        });
        if (changes && changes.length > 0) {
          progress.updated++;
        }
      } else if (userInCrm.status === "to-create") {
        // Create a mock request for the createContact call
        const url = new URL(`${process.env.NEXTAUTH_URL}/admin/xrm/sync`);
        const request = new Request(url.toString());

        const created = await CrmService.createContact({
          request,
          tenantId: null,
          firstName: userInCrm.firstName ?? "",
          lastName: userInCrm.lastName ?? "",
          email: userInCrm.email,
          jobTitle: "",
          status: ContactStatus.Customer,
          marketingSubscriber: true,
          options: {
            createEvent: false,
            checkUsage: false,
            createLog: false,
            storeMedia: false,
            reportUsage: false,
          },
        });
        if (created) {
          progress.created++;
        }
      }
    }

    // Revalidate the page to refresh data
    revalidatePath("/admin/xrm/sync");

    if (progress.created === 0 && progress.updated === 0) {
      return { error: "No users to sync" };
    } else if (progress.created > 0 && progress.updated === 0) {
      return { success: `Created ${progress.created} contacts.` };
    } else if (progress.created === 0 && progress.updated > 0) {
      return { success: `Updated ${progress.updated} contacts.` };
    }
    return {
      success: `Created ${progress.created} contacts, updated ${progress.updated}.`,
    };
  } catch (error) {
    console.error("Sync error:", error);
    return { error: error instanceof Error ? error.message : "An error occurred during sync" };
  }
}
