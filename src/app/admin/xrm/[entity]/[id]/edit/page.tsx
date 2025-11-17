import ServerError from "@/components/ui/errors/ServerError";
import RowEditRoute from "@/modules/rows/components/RowEditRoute";
import { loader as rowsEditLoader, action as rowsEditAction } from "@/modules/rows/routes/Rows_Edit.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { Metadata } from "next";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await rowsEditLoader(props);
  const metaTag = data?.meta?.[0];
  return {
    title: metaTag?.title || undefined,
  };
}

export const loader = (props: IServerComponentsProps) => rowsEditLoader(props);
export const action = (formData: FormData, props?: IServerComponentsProps) => rowsEditAction(formData, props);

export default async function Page(props: IServerComponentsProps) {
  const data = await rowsEditLoader(props);
  return <RowEditRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
