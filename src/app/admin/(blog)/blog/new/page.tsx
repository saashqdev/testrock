import type { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { BlogRoutesNewApi } from "@/modules/blog/routes/api/BlogRoutes.New.Api";
import BlogNewView from "@/modules/blog/routes/views/BlogRoutes.New.View";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  try {
    const params = (await props.params) || {};
    return await BlogRoutesNewApi.generateMetadata({ params });
  } catch (error) {
    return {};
  }
}

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  return BlogRoutesNewApi.loader({ request, params });
};

export const action = async (props: IServerComponentsProps) => {
  return BlogRoutesNewApi.action(props);
};

export default async function BlogNewPage(props: IServerComponentsProps) {
  const data = await loader(props);
  return <BlogNewView data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
