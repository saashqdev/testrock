import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { Metadata } from "next";
import { loader } from "./seed.server";
import ServerError from "@/components/ui/errors/ServerError";
import RolesPermissionsSeedView from "@/app/admin/accounts/roles-and-permissions/seed/SeedView";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return {
    title: data?.title || undefined,
  };
}

export default async function Page(props: IServerComponentsProps) {
  const data = await loader(props);
  return <RolesPermissionsSeedView data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
