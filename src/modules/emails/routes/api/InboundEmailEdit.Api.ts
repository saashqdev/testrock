export type { LoaderData, ActionData } from "../InboundEmailEdit";
export { loader, action } from "../InboundEmailEdit";

export async function generateMetadata({ params }: { params: { tenant?: string; id: string } }) {
  return {
    title: `Email | ${process.env.APP_NAME}`,
  };
}

