import { redirect } from "next/navigation";
import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { FakeProjectService } from "@/modules/fake/fakeProjectsCrud/services/FakeCrudService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import FakeProjectClient from "./FakeProjectClient";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const params = (await props.params) || {};
  const item = await FakeProjectService.get(params.id!);
  if (!item) {
    return { title: "Project Not Found" };
  }
  return { title: item.name };
}

export default async function FakeProjectPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const item = await FakeProjectService.get(params.id!);
  
  if (!item) {
    redirect("/admin/playground/crud/projects");
  }

  return <FakeProjectClient item={item} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
