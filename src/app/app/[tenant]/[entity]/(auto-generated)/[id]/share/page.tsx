import ServerError from "@/components/ui/errors/ServerError";
import RowShareRoute from "@/modules/rows/components/RowShareRoute";
import { LoaderData, loader as shareLoader, action as shareAction } from "@/modules/rows/routes/Rows_Share.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export const loader = (props: IServerComponentsProps) => shareLoader(props);
export const action = (props: IServerComponentsProps) => shareAction(props);

export default async function SharePage(props: IServerComponentsProps) {
  const response = await shareLoader(props);
  const data = await response.json() as LoaderData;
  return <RowShareRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
