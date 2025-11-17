import { LoaderData, loader } from "../Campaigns_List";

export type LoaderData = LoaderData;

export const loader = loader;

export async function generateMetadata({ params }: { params: { tenant?: string } }) {
  return {
    title: `Campaigns | ${process.env.APP_NAME}`,
  };
}
