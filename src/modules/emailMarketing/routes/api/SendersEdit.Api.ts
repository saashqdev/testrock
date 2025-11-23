import { LoaderData as SendersEditLoaderData, loader as sendersEditLoader } from "../Senders_Edit";

export type LoaderData = SendersEditLoaderData;

export const loader = sendersEditLoader;

export async function generateMetadata({ params }: { params: { tenant?: string; id: string } }) {
  return {
    title: `Edit Sender | ${process.env.APP_NAME}`,
  };
}
