import { loader as exportLoader } from "@/modules/rows/routes/Rows_Export.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export default async function Page(props: IServerComponentsProps) {
  return await exportLoader(props);
}
