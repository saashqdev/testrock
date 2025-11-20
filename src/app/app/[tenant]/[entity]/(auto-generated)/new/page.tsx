import ServerError from "@/components/ui/errors/ServerError";
import RowNewRoute from "@/modules/rows/components/RowNewRoute";
import { LoaderData, loader as rowsNewLoader } from "@/modules/rows/routes/Rows_New.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import type { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import TitleDataLayout from "@/context/TitleDataLayout";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await rowsNewLoader(props);
  const loaderData = await data.json() as LoaderData;

  // Convert NextJS-style meta array to Next.js Metadata
  const metadata: Metadata = {};
  if (loaderData?.meta) {
    for (const meta of loaderData.meta) {
      if ('title' in meta) {
        metadata.title = meta.title;
      }
    }
  }
  return metadata;
}

export default async function Page(props: IServerComponentsProps) {
  const response = await rowsNewLoader(props);
  const data = await response.json() as LoaderData;
  
  // Extract title from meta tags
  let title = "";
  if (data?.meta) {
    for (const meta of data.meta) {
      if ('title' in meta && meta.title) {
        title = meta.title;
        break;
      }
    }
  }
  
  return (
    <TitleDataLayout data={{ title }}>
      <RowNewRoute data={data} />
    </TitleDataLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
