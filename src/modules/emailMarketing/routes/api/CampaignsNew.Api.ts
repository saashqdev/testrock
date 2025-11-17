import { LoaderData, loader, ActionData, action } from "../Campaigns_New";

export type LoaderData = LoaderData;
export type ActionData = ActionData;

export const loader = loader;
export const action = action;

export async function generateMetadata({ params }: { params: { tenant?: string } }) {
  return {
    title: `New Campaign | ${process.env.APP_NAME}`,
  };
}

