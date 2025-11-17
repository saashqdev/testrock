import { LoaderData, loader } from "../Senders_Edit";

export type LoaderData = LoaderData;

export const loader = loader;

export async function generateMetadata({ params }: { params: { tenant?: string; id: string } }) {
  return {
    title: `Edit Sender | ${process.env.APP_NAME}`,
  };
}

