import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { WorkflowExecutionWithDetailsDto } from "@/db/models/workflows/WorkflowExecutionsModel";

export type LoaderData = {
  metatags: MetaTagsDto;
  items: WorkflowExecutionWithDetailsDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "workflowId",
      title: "Workflow",
      manual: true,
      options: (await db.workflows.getWorkflowsIdsAndNames({ tenantId: tenantId?.toString() ?? null })).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
    {
      name: "status",
      title: "Status",
      manual: true,
      options: ["running", "success", "error"].map((item) => {
        return { value: item, name: item };
      }),
    },
    {
      name: "type",
      title: "Type",
      manual: true,
      options: ["manual", "api", "stream"].map((item) => {
        return { value: item, name: item };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const urlSearchParams = request?.url ? new URL(request.url).searchParams : new URLSearchParams();
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await db.workflowExecutions.getAllWorkflowExecutions({
    tenantId: tenantId?.toString() ?? null,
    pagination: currentPagination,
    filters,
  });
  const data: LoaderData = {
    metatags: [{ title: `Workflow Executions | ${process.env.APP_NAME}` }],
    items,
    pagination,
    filterableProperties,
  };
  return data;
};

export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request;
  if (!request) {
    return Response.json({ error: "Request is required" }, { status: 400 });
  }
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const form = await request.formData();
  const action = form.get("action")?.toString();

  if (action === "delete") {
    const id = form.get("id")?.toString() ?? "";
    const execution = await db.workflowExecutions.getWorkflowExecution(id, { tenantId: tenantId?.toString() ?? null });
    if (!execution) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    await db.workflowExecutions.deleteWorkflowExecution(id);
    return Response.json({ success: true });
  } else {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }
};
