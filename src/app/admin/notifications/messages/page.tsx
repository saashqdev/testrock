import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import ServerError from "@/components/ui/errors/ServerError";
import InputFilters from "@/components/ui/input/InputFilters";
import NotificationMessagesTable from "@/modules/notifications/components/NotificationMessagesTable";
import NotificationService, { IGetMessagesData } from "@/modules/notifications/services/server/NotificationService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";

type LoaderData = {
  items: IGetMessagesData | null;
  filterableProperties: FilterablePropertyDto[];
};

const loader = async (searchParams: { [key: string]: string | string[] | undefined }) => {
  await verifyUserHasPermission("admin.notifications.view");

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "subscriberId",
      title: "Subscriber ID",
    },
    {
      name: "channel",
      title: "Channel",
    },
  ];

  // Convert searchParams object to URLSearchParams for compatibility
  const urlSearchParams = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        urlSearchParams.set(key, Array.isArray(value) ? value[0] : value);
      }
    });
  }

  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const items = await NotificationService.getMessages({
    limit: currentPagination.pageSize,
    page: currentPagination.page,
    subscriberId: searchParams?.subscriberId?.toString(),
    channel: searchParams?.channel?.toString(),
  });

  const data: LoaderData = {
    items,
    filterableProperties,
  };
  return data;
};

export default async function NotificationMessagesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const data = await loader(params);

  return (
    <>
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
        <div className="md:border-b md:border-border md:py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-foreground">Messages</h3>
            <div className="flex items-center space-x-2">
              <InputFilters filters={data.filterableProperties} />
            </div>
          </div>
        </div>

        <NotificationMessagesTable items={data.items} />
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
