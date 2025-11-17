import { LoaderData, ActionData, loader, action } from "../InboundEmailEdit";

export type LoaderData = LoaderData;
export type ActionData = ActionData;

export const loader = loader;
export const action = action;

export async function generateMetadata({ params }: { params: { tenant?: string; id: string } }) {
  return {
    title: `Email | ${process.env.APP_NAME}`,
  };
}

