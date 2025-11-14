import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { Metadata } from "next";
import { RolesPermissionsSeed } from "./seed.server";
import ServerError from "@/components/ui/errors/ServerError";
import RolesPermissionsSeedView from "@/app/admin/accounts/roles-and-permissions/seed/SeedView";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await RolesPermissionsSeed.loader(props);
  return {
    title: data?.title || undefined,
  };
}

export const loader = (props: IServerComponentsProps) => RolesPermissionsSeed.loader(props);
export const action = (formData: FormData, props?: IServerComponentsProps) => RolesPermissionsSeed.action(formData, props);

export default async function Page(props: IServerComponentsProps) {
  const data = await RolesPermissionsSeed.loader(props);
  return <RolesPermissionsSeedView data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
