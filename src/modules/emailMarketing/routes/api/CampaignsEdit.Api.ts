export type { LoaderData, ActionData } from "../Campaigns_Edit";
export { loader, action } from "../Campaigns_Edit";

export async function generateMetadata({ params }: { params: { tenant?: string; id: string } }) {
  return {
    title: `Edit Campaign | ${process.env.APP_NAME}`,
  };
}
