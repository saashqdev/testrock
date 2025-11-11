import { redirect } from "next/navigation";
import Logo from "@/components/brand/Logo";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import { Metadata } from "next";
import RegisterClient from "./component";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("account.register.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function RegisterRoute() {
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.subscription.allowSignUpBeforeSubscribe) {
    redirect("/pricing");
  }

  return (
    <div className="">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-5">
          <Logo className="mx-auto h-9" />
          <RegisterClient />
        </div>
      </div>
    </div>
  );
}
