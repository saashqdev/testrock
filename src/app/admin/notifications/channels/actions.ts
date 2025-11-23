"use server";

import { db } from "@/db";
import { getUserInfo } from "@/lib/services/session.server";
import NotificationService from "@/modules/notifications/services/server/NotificationService";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";

type ActionData = {
  error?: string;
  success?: string;
};

export async function handleNotificationAction(formData: FormData): Promise<ActionData> {
  try {
    // Permission check
    await verifyUserHasPermission("admin.notifications.view");
    const userInfo = await getUserInfo();

    if (!userInfo?.userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.users.getUser(userInfo.userId);
    const action = formData.get("action");

    if (action === "delete") {
      const id = formData.get("id")?.toString() ?? "";
      try {
        await NotificationService.deleteNotificationTemplate(id.toString());
        return { success: `Notification template deleted` };
      } catch (e: any) {
        return { error: e.message };
      }
    } else if (action === "create") {
      // const name = formData.get("name")?.toString() ?? "";
      // const description = formData.get("description")?.toString() ?? "";
      try {
        // await NotificationService.createNotificationTemplate({
        //   notificationGroupId: "",
        //   name,
        //   description,
        //   steps: [],
        //   active: true,
        //   draft: false,
        //   critical: false,
        // });
        return { success: `TODO` };
      } catch (e: any) {
        return { error: e.message };
      }
    } else if (action === "send-preview") {
      const channel = formData.get("channel")?.toString() ?? "";
      try {
        await NotificationService.send({
          channel,
          to: user!,
          notification: {
            message: "This is a test message to #" + channel,
          },
        });
        return { success: `Preview sent to channel: ` + channel };
      } catch (e: any) {
        return { error: e.message };
      }
    }

    return { error: "Invalid action" };
  } catch (e: any) {
    return { error: e.message };
  }
}
