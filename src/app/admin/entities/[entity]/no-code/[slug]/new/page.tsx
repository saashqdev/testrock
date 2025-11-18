import ServerError from "@/components/ui/errors/ServerError";
import RowNewRoute from "@/modules/rows/components/RowNewRoute";
import { LoaderData, loader as loaderFn } from "@/modules/rows/routes/Rows_New.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import type { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  try {
    const response = await loaderFn(props);
    const data = (await response.json()) as LoaderData;
    const metadata: Metadata = {};
    if (data?.meta) {
      for (const tag of data.meta) {
        if ("title" in tag) {
          metadata.title = tag.title;
        }
      }
    }
    return metadata;
  } catch (e: any) {
    return { title: "Error" };
  }
}

export default async function Page(props: IServerComponentsProps) {
  try {
    const response = await loaderFn(props);
    const data = (await response.json()) as LoaderData;
    return <RowNewRoute data={data} />;
  } catch (e: any) {
    return <ServerError error={e} />;
  }
}

export function ErrorBoundary() {
  return <ServerError />;
}
