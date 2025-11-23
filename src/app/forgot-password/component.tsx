"use client";

import Logo from "@/components/brand/Logo";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import ErrorModal, { RefErrorModal } from "@/components/ui/modals/ErrorModal";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import ExclamationTriangleIcon from "@/components/ui/icons/ExclamationTriangleIcon";
import SuccessBanner from "@/components/ui/banners/SuccessBanner";
import InputText from "@/components/ui/input/InputText";
import SuccessModal, { RefSuccessModal } from "@/components/ui/modals/SuccessModal";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type ActionData = {
  success?: string;
  error?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();

  return (
    <LoadingButton type="submit" disabled={pending} className="w-full">
      {t("account.reset.button")}
    </LoadingButton>
  );
}

export default function ForgotPasswordForm({ action }: { action: (prevState: ActionData | null, formData: FormData) => Promise<ActionData> }) {
  const { t } = useTranslation();
  const [actionData, formAction] = useActionState(action, null);

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
    if (actionData?.success) {
      setEmailSent(true);
    }
  }, [actionData]);

  return (
    <div className="">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-5">
          <Logo className="mx-auto h-9" />
          <div className="flex flex-col items-center">
            <div className="text-left text-2xl font-extrabold">{t("account.forgot.title")}</div>
            <div className="mt-1 text-center">
              <Link href="/login" className="font-medium text-primary hover:underline">
                {t("account.register.clickHereToLogin")}
              </Link>
            </div>
          </div>

          <div className="mx-auto flex flex-col items-center space-y-6 rounded-lg border border-border p-6">
            <form action={formAction} className="w-full space-y-3">
              <div>
                <InputText title={t("account.shared.email")} id="email" name="email" type="email" placeholder="email@address.com" required defaultValue="" />
              </div>
              <div className="flex items-center justify-end">
                <SubmitButton />
              </div>
              <div id="form-error-message">
                {actionData?.error ? (
                  <div className="flex items-center justify-center space-x-2 text-sm text-red-500 dark:text-red-300" role="alert">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <div>{actionData.error}</div>
                  </div>
                ) : null}
              </div>
            </form>
          </div>

          {emailSent && (
            <div className="mt-8">
              <SuccessBanner title={t("account.reset.resetSuccess")} text={t("account.reset.emailSent")} />
            </div>
          )}
        </div>
      </div>

      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
