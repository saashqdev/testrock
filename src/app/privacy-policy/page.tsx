import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getServerTranslations } from "@/i18n/server";
import PrivacyPolicyClient from "./component";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("front.privacy.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function PrivacyPolicyPage(props: IServerComponentsProps) {
  return <PrivacyPolicyClient />;
}
