import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { loader } from "./new.server";
import AdminNewRoleRoute from "./new";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return {
    title: data.title,
  };
}

export default async function Page(props: IServerComponentsProps) {
  const data = await loader(props);
  return <AdminNewRoleRoute permissions={data.permissions} />;
}
