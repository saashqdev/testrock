"use server";

import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { loader } from "./api/server";
import WorkflowsVariablesIdView from "./view";

export default async function WorkflowsVariablesIdPage(props: IServerComponentsProps) {
  const data = await loader(props);

  return <WorkflowsVariablesIdView data={data} />;
}
