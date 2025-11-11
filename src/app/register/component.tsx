"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { RegisterForm } from "@/modules/users/components/RegisterForm";
import SuccessBanner from "@/components/ui/banners/SuccessBanner";
import { useActionState } from "react";
import { registerAction } from "@/app/register/actions";

type ActionData = {
  error?: string;
  verificationEmailSent?: boolean;
};

export default function RegisterClient() {
  const { t } = useTranslation();
  const [actionData, formAction] = useActionState<ActionData | null, FormData>(registerAction, null);

  return (
    <>
      <div className="flex flex-col items-center">
        {!actionData?.verificationEmailSent ? (
          <>
            <h1 className="text-left text-2xl font-extrabold">{t("account.register.title")}</h1>
            <p className="mt-1 text-center">
              <Link href="/login" className="text-primary font-medium hover:underline">
                {t("account.register.clickHereToLogin")}
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-left text-2xl font-extrabold">{t("account.verify.title")}</h1>
            <div className="mt-8">
              <SuccessBanner title={t("shared.success")} text={t("account.verify.emailSent")} />
            </div>
          </>
        )}
      </div>

      {!actionData?.verificationEmailSent && <RegisterForm requireRecaptcha error={actionData?.error} action={formAction} />}
    </>
  );
}
