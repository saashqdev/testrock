import { LoaderData, loader } from "../EmailMarketing_Summary";

export type LoaderData = LoaderData;

export const loader = loader;

export async function generateMetadata({ params }: { params: { tenant?: string } }) {
  return {
    title: `Email Marketing | ${process.env.APP_NAME}`,
  };
}
