import NotificationChannelsPage from "./NotificationChannelsPage";
import NotificationService from "@/modules/notifications/services/server/NotificationService";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";

export default async function NotificationChannelsPageWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Permission check
  await verifyUserHasPermission("admin.notifications.view");
  
  // Get pagination from search params
  const params = await searchParams;
  const page = params.page ? parseInt(params.page as string) : 1;
  
  // Fetch data
  const items = await NotificationService.getNotificationTemplates({
    limit: 100,
    page: page - 1,
  });

  return <NotificationChannelsPage items={items} />;
}
