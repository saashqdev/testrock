import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Entity Groups | ${process.env.APP_NAME}`,
  };
}

export default async function EntityGroupsPage() {
  return null;
}
