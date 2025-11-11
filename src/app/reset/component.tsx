"use client";

import Logo from "@/components/brand/Logo";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import ErrorModal, { RefErrorModal } from "@/components/ui/modals/ErrorModal";
import { useEffect, useRef, useState, use } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import ExclamationTriangleIcon from "@/components/ui/icons/ExclamationTriangleIcon";
import InputText from "@/components/ui/input/InputText";
import { useFormState, useFormStatus } from "react-dom";

type ActionData = {
  success?: string;
  error?: string;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  
  return (
    <LoadingButton type="submit" disabled={pending || disabled} className="w-full">
      {t("account.newPassword.button")}
    </LoadingButton>
  );
}

export default function ResetPasswordForm({
  action,
  searchParams,
}: {
  action: (prevState: ActionData | null, formData: FormData) => Promise<ActionData | null>;
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  const { t } = useTranslation();
  const [actionData, formAction] = useFormState(action, null);

  const errorModal = useRef<RefErrorModal>(null);

  // Unwrap the searchParams promise
  const params = use(searchParams);
  const email = params.e ? decodeURIComponent(params.e) : "";
  const verifyToken = params.t || "";

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    }
  }, [actionData]);

  return (
    <div className="">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-5">
          <Logo className="mx-auto h-9" />
          <div className="flex flex-col items-center">
            <div className="text-left text-2xl font-extrabold">{t("account.newPassword.title")}</div>
            <div className="mt-1 text-left">
              <Link href="/login" className="text-primary font-medium hover:underline">
                {t("account.register.clickHereToLogin")}
              </Link>
            </div>
          </div>

          <div className="border-border mx-auto flex flex-col items-center space-y-6 rounded-lg border p-6">
            <form action={formAction} className="w-full space-y-3">
              <input type="hidden" name="verify-token" defaultValue={verifyToken} required readOnly />
              <div>
                <InputText
                  title={t("account.shared.email")}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@address.com"
                  readOnly
                  defaultValue={email}
                  required
                />
              </div>
              <div>
                <InputText
                  title={t("account.shared.password")}
                  autoFocus
                  id="password"
                  name="password"
                  type="password"
                  placeholder="************"
                  readOnly={!email}
                  defaultValue=""
                  required
                />
              </div>
              <div>
                <InputText
                  title={t("account.register.confirmPassword")}
                  name="password-confirm"
                  type="password"
                  placeholder="************"
                  readOnly={!email}
                  defaultValue=""
                  required
                />
              </div>
              <div className="flex items-center justify-end">
                <SubmitButton disabled={!email} />
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
        </div>
      </div>

      <ErrorModal ref={errorModal} />
    </div>
  );
}
