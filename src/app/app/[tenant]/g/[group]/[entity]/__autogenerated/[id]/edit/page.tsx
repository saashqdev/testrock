import ServerError from "@/components/ui/errors/ServerError";
import RowEditRoute from "@/modules/rows/components/RowEditRoute";
import { Rows_Edit } from "@/modules/rows/routes/Rows_Edit.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { Metadata } from "next";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await Rows_Edit.loader(props);
  const metaTag = data?.meta?.[0];
  return {
    title: metaTag?.title || undefined,
  };
}

export const loader = (props: IServerComponentsProps) => Rows_Edit.loader(props);
export const action = (formData: FormData, props?: IServerComponentsProps) => Rows_Edit.action(formData, props);

export default async function Page(props: IServerComponentsProps) {
  const data = await Rows_Edit.loader(props);
  return <RowEditRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
