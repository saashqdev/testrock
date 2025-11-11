"use client";

import Link from "next/link";
import { Registration } from "@prisma/client";
import { RegisterForm } from "@/modules/users/components/RegisterForm";
import { useTranslation } from "react-i18next";

type VerifyPageClientProps = {
  registration: Registration;
  fieldsData?: {
    email?: string;
    password?: string;
    company?: string;
    firstName?: string;
    lastName?: string;
    slug?: string;
  };
  error?: string;
};

export function VerifyPageClient({ registration, fieldsData, error }: VerifyPageClientProps) {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <h1 className="text-foreground mt-6 text-center text-lg font-bold leading-9 dark:text-slate-200">
          {t("account.verify.title")}
        </h1>
        <p className="max-w text-foreground mt-2 text-center text-sm leading-5 dark:text-slate-200">
          {t("account.register.alreadyRegistered")}{" "}
          <span className="text-primary font-medium hover:underline">
            <Link href="/login">{t("account.register.clickHereToLogin")}</Link>
          </span>
        </p>
      </div>
      <RegisterForm
        isVerifyingEmail
        data={{
          company: fieldsData?.company ?? registration?.company ?? "",
          firstName: fieldsData?.firstName ?? registration?.firstName,
          lastName: fieldsData?.lastName ?? registration?.lastName,
          email: fieldsData?.email ?? registration?.email,
          slug: fieldsData?.slug ?? registration?.slug ?? "",
        }}
        error={error}
      />
    </>
  );
}
