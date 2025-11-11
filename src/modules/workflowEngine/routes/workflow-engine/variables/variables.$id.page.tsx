"use server";

import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { WorkflowsVariablesIdApi } from "./variables.$id.api.server";
import WorkflowsVariablesIdView from "./variables.$id.view";

export default async function WorkflowsVariablesIdPage(props: IServerComponentsProps) {
  const data = await WorkflowsVariablesIdApi.loader(props);

  return <WorkflowsVariablesIdView data={data} />;
}
