import Link from "next/link";
import BreadcrumbSimple from "@/components/ui/breadcrumbs/BreadcrumbSimple";
import WorkflowUtils from "@/modules/workflowEngine/helpers/WorkflowUtils";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import UrlUtils from "@/utils/app/UrlUtils";
import WorkflowRunDropdown from "@/modules/workflowEngine/components/workflows/buttons/WorkflowRunDropdown";
import { loader } from "./workflows.$id.index.api.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import WorkflowEditorClient from "./WorkflowEditorClient";
import WorkflowToggle from "./WorkflowToggle";
import { toggleWorkflowAction } from "./workflowActions";

export default async function WorkflowsIdIndexView(props: IServerComponentsProps) {
  const data = await loader(props);
  const params = (await props.params) || {};

  async function handleToggle(formData: FormData) {
    "use server";
    formData.append("workflowId", data.item.id);
    return toggleWorkflowAction(null, formData);
  }

  return (
    <div>
      <div className="shadow-2xs w-full border-b border-border bg-background px-4 py-2">
        <BreadcrumbSimple menu={[{ title: "Workflows", routePath: UrlUtils.getModulePath(params, `workflow-engine/workflows`) }, { title: data.item.name }]} />
      </div>
      <div className="shadow-2xs w-full border-b border-border bg-background px-4 py-2">
        <div className="flex justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <WorkflowToggle workflow={data.item} onToggle={handleToggle} />
            <SimpleBadge title={WorkflowUtils.getStatusTitle(data.item)} color={WorkflowUtils.getStatusColor(data.item)} />
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href={`executions`}
              className="shadow-2xs rounded bg-background px-2 py-1 text-sm font-semibold text-foreground/80 ring-1 ring-inset ring-gray-300 hover:bg-secondary"
            >
              View all executions
            </Link>
            <WorkflowRunDropdown workflow={data.item} />
          </div>
        </div>
      </div>

      <WorkflowEditorClient workflow={data.item} />
    </div>
  );
}
