import ServerError from "@/components/ui/errors/ServerError";
import NotificationSubscribersTable from "@/modules/notifications/components/NotificationSubscribersTable";
import NotificationService, { IGetSubscribersData } from "@/modules/notifications/services/server/NotificationService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";

type LoaderData = {
  items: IGetSubscribersData | null;
};

async function getData(searchParams: { [key: string]: string | string[] | undefined }): Promise<LoaderData> {
  await verifyUserHasPermission("admin.notifications.view");

  const urlSearchParams = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        urlSearchParams.set(key, Array.isArray(value) ? value[0] : value);
      }
    });
  }

  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const items = await NotificationService.getSubscribers(currentPagination);

  return {
    items,
  };
}

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const data = await getData(params);

  return (
    <>
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
        <div className="md:border-b md:border-border md:py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-foreground">Subscribers</h3>
            <div className="flex items-center space-x-2">{/* <InputFilters filters={[]} /> */}</div>
          </div>
        </div>

        <NotificationSubscribersTable items={data.items} />
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
