import ServerError from "@/components/ui/errors/ServerError";
import { LoaderData, loader as rowsListLoader, action as rowsListAction } from "@/modules/rows/routes/Rows_List.server";
import RowsAllInOneRoute from "@/modules/rows/components/RowsAllInOneRoute";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  try {
    const result = await rowsListLoader(props);
    // Check if it's a redirect response
    if (result instanceof Response && (result.status === 302 || result.status === 301)) {
      return {};
    }
    const loaderData = (result instanceof Response ? await result.json() : result) as LoaderData;
    
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
  } catch (error) {
    console.error('[all-in-one metadata] Error:', error);
    return {};
  }
}

export default async function (props: IServerComponentsProps) {
  const result = await rowsListLoader(props);
  
  // Check if it's a redirect response
  if (result instanceof Response) {
    if (result.status === 302 || result.status === 301) {
      throw result; // Let Next.js handle the redirect
    }
    
    // Check content type before parsing as JSON
    const contentType = result.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('[all-in-one] Unexpected content type:', contentType, 'Status:', result.status);
      const text = await result.text();
      console.error('[all-in-one] Response body preview:', text.substring(0, 200));
      throw new Error(`Expected JSON response but got ${contentType}. Status: ${result.status}`);
    }
  }
  
  const data = (result instanceof Response ? await result.json() : result) as LoaderData;
  
  return <RowsAllInOneRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
