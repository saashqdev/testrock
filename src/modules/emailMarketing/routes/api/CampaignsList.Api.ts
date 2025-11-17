export type { LoaderData } from "../Campaigns_List";
export { loader } from "../Campaigns_List";

export async function generateMetadata({ params }: { params: { tenant?: string } }) {
  return {
    title: `Campaigns | ${process.env.APP_NAME}`,
  };
}
