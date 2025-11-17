export type { LoaderData } from "../EmailMarketing_Summary";
export { loader } from "../EmailMarketing_Summary";

export async function generateMetadata({ params }: { params: { tenant?: string } }) {
  return {
    title: `Email Marketing | ${process.env.APP_NAME}`,
  };
}
