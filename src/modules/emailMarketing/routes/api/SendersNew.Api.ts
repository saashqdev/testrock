import { LoaderData, loader } from "../Senders_New";

export type LoaderData = LoaderData;

export const loader = loader;

export async function generateMetadata({ params }: { params: { tenant?: string } }) {
  return {
    title: `New Sender | ${process.env.APP_NAME}`,
  };
}

