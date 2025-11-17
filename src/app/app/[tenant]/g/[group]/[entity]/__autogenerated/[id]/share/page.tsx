import ServerError from "@/components/ui/errors/ServerError";
import RowShareRoute from "@/modules/rows/components/RowShareRoute";
import { LoaderData, loader as rowsShareLoader, action as rowsShareAction } from "@/modules/rows/routes/Rows_Share.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export const loader = (props: IServerComponentsProps) => rowsShareLoader(props);
export const action = (props: IServerComponentsProps) => rowsShareAction(props);

export default async function SharePage(props: IServerComponentsProps) {
  const response = await rowsShareLoader(props);
  const data = await response.json() as LoaderData;
  return <RowShareRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
