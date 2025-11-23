import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getServerTranslations } from "@/i18n/server";
import TermsAndConditionsClient from "./component";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("front.terms.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function TermsAndConditionsPage(props: IServerComponentsProps) {
  return <TermsAndConditionsClient />;
}
