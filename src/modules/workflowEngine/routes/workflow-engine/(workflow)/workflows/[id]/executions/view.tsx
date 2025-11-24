import Link from "next/link";
import BreadcrumbSimple from "@/components/ui/breadcrumbs/BreadcrumbSimple";
import WorkflowRunDropdown from "@/modules/workflowEngine/components/workflows/buttons/WorkflowRunDropdown";
import UrlUtils from "@/utils/app/UrlUtils";
import { loader } from "./api/server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import WorkflowExecutionsClient from "../../../WorkflowExecutionsClient";

export default async function WorkflowsIdExecutionsView(props: IServerComponentsProps) {
  const data = await loader(props);
  const params = (await props.params) || {};

  return (
    <div>
      <div className="shadow-2xs w-full border-b border-border bg-background px-4 py-2">
        <BreadcrumbSimple menu={[{ title: "Workflows", routePath: UrlUtils.getModulePath(params, `workflow-engine/workflows`) }, { title: data.item.name }]} />
      </div>
      <div className="shadow-2xs w-full border-b border-border bg-background px-4 py-2">
        <div className="flex justify-between">
          <Link
            href={UrlUtils.getModulePath(params, `workflow-engine/workflows/${data.item.id}`)}
            className="shadow-2xs rounded bg-background px-2 py-1 text-sm font-semibold text-foreground/80 ring-1 ring-inset ring-gray-300 hover:bg-secondary"
          >
            <span className="mr-1">&larr;</span> Back to editor
          </Link>
          <WorkflowRunDropdown workflow={data.item} />
        </div>
      </div>

      <WorkflowExecutionsClient workflow={data.item} executions={data.executions} />
    </div>
  );
}
