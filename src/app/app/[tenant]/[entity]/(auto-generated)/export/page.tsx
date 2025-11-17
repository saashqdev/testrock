import { loader as rowsExportLoader } from "@/modules/rows/routes/Rows_Export.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export default async function (props: IServerComponentsProps) {
  return await rowsExportLoader(props);
}
