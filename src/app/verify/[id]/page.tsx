import { Metadata } from "next";
import Logo from "@/components/brand/Logo";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import { VerifyPageClient } from "./VerifyPageClient";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("account.verify.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function VerifyPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { t } = await getServerTranslations();
  
  const registration = await db.registration.getRegistrationByToken(resolvedParams.id ?? "");
  
  // Get any error or field data from searchParams (passed after form submission redirect)
  const error = resolvedSearchParams?.error as string | undefined;
  const fieldsData = resolvedSearchParams?.fields ? JSON.parse(decodeURIComponent(resolvedSearchParams.fields as string)) : undefined;

  return (
    <div className="bg-background">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <Logo className="mx-auto h-12 w-auto" />

          {registration && !registration.createdTenantId ? (
            <VerifyPageClient
              registration={registration}
              fieldsData={fieldsData}
              error={error}
            />
          ) : (
            <div>
              <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto mb-4 w-full max-w-md rounded-sm px-8 pb-8">
                  <div className="text-xl font-black">
                    <h1 className="mt-6 text-center text-lg font-extrabold">{t("account.verify.title")}</h1>
                  </div>
                  <div className="my-4 leading-tight">
                    <p className="max-w mt-2 text-center text-sm leading-5">{t("account.verify.invalidLink")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
