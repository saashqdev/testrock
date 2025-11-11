import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { getServerTranslations } from "@/i18n/server";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { FeedbackWithDetailsDto } from "@/db/models/helpDesk/FeedbackModel";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import FeedbackTable from "@/modules/helpDesk/components/FeedbackTable";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";
import { headers } from "next/headers";
import FeedbackServer from "@/modules/helpDesk/services/Feedback.server";
import { revalidatePath } from "next/cache";
import { Metadata } from "next";
import "server-only";

type LoaderData = {
  items: FeedbackWithDetailsDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
};

async function getLoaderData(searchParams: { [key: string]: string | string[] | undefined }): Promise<LoaderData> {
  await requireAuth();
  
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "tenantId",
      title: "models.tenant.object",
      options: [
        { value: "null", name: "{null}" },
        ...(await db.tenants.adminGetAllTenantsIdsAndNames()).map((item) => {
          return {
            value: item.id,
            name: item.name,
          };
        }),
      ],
    },
    {
      name: "userId",
      title: "models.user.object",
      options: [
        { value: "null", name: "{null}" },
        ...(await db.users.adminGetAllUsersNames()).map((item) => {
          return {
            value: item.id,
            name: item.email,
          };
        }),
      ],
    },
  ];
  
  const urlSearchParams = new URLSearchParams(searchParams as any);
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  
  // Create a mock request object for getFiltersFromCurrentUrl
  const headersList = await headers();
  const url = headersList.get('x-url') || `http://localhost?${urlSearchParams.toString()}`;
  const request = new Request(url);
  
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const { items, pagination } = await db.feedback.getAllFeedback({ filters, filterableProperties, pagination: currentPagination });
  
  return {
    items,
    filterableProperties,
    pagination,
  };
}

// Server Action for delete functionality
export async function deleteFeedback(formData: FormData) {
  "use server";
  
  await requireAuth();
  const { t } = await getServerTranslations();
  
  const action = formData.get("action");
  
  if (action === "delete") {
    const ids = (formData.get("ids")?.toString().split(",") ?? []).map((x) => x.toString() ?? "");
    
    try {
      await FeedbackServer.deleteMany({ ids });
      revalidatePath("/admin/help-desk/feedback");
      return { success: true };
    } catch (error) {
      return { error: t("shared.error"), success: false };
    }
  } else {
    return { error: t("shared.invalidForm"), success: false };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("feedback.plural")} | ${process.env.APP_NAME}`,
  };
}

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { t } = await getServerTranslations();
  const resolvedSearchParams = await searchParams;
  const data = await getLoaderData(resolvedSearchParams);
  
  return (
    <EditPageLayout title={t("feedback.plural")}>
      <FeedbackTable data={data} deleteAction={deleteFeedback} />
    </EditPageLayout>
  );
}
