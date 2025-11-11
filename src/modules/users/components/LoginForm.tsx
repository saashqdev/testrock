"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import ExclamationTriangleIcon from "@/components/ui/icons/ExclamationTriangleIcon";
import GitHubIcon from "@/components/ui/icons/GitHubIcon";
import GoogleIcon from "@/components/ui/icons/GoogleIcon";
import InputText, { RefInputText } from "@/components/ui/input/InputText";
import { useRootData } from "@/lib/state/useRootData";

export type LoginActionData = {
  error?: string;
  fieldErrors?: {
    email: string | undefined;
    password: string | undefined;
  };
  fields?: {
    email: string;
    password: string;
  };
};

// Separate component to use useFormStatus
function LoginFormFields({
  actionData,
  redirectTo,
  emailInput,
}: {
  actionData: LoginActionData | null | undefined;
  redirectTo?: string;
  emailInput: React.RefObject<RefInputText | null>;
}) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  // Note: useFormStatus would be used here if we need pending state from the form
  // For now, we'll keep it simple and rely on the button's built-in loading state

  return (
    <>
      <input type="hidden" name="action" value="login" hidden readOnly />
      <input type="hidden" name="redirectTo" value={redirectTo ?? searchParams?.get("redirect") ?? undefined} />
      <div>
        <InputText
          ref={emailInput}
          title={t("account.shared.email")}
          autoFocus
          id="email"
          name="email"
          type="email"
          required
          placeholder="email@address.com"
          defaultValue={actionData?.fields?.email}
        />
        {actionData?.fieldErrors?.email ? (
          <p className="text-destructive-foreground py-2 text-xs" role="alert" id="email-error">
            {actionData.fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div>
        <InputText
          id="password"
          title={t("account.shared.password")}
          name="password"
          type="password"
          required
          placeholder="************"
          defaultValue={actionData?.fields?.password}
        />
        {actionData?.fieldErrors?.password ? (
          <p className="text-destructive-foreground py-2 text-xs" role="alert" id="password-error">
            {actionData.fieldErrors.password}
          </p>
        ) : null}
      </div>
      <div className="flex items-center justify-between">
        <Link href="/forgot-password" className="text-foreground inline-block align-baseline text-xs font-medium hover:underline">
          {t("account.login.forgot")}
        </Link>
        <LoadingButton className="block w-full" type="submit" actionName="login">
          {t("account.login.button")}
        </LoadingButton>
      </div>
      <div id="form-error-message">
        {actionData?.error ? (
          <div className="flex items-center justify-center space-x-2 text-sm text-red-500 dark:text-red-300" role="alert">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <div>{actionData.error}</div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default function LoginForm({
  actionData,
  redirectTo,
  formAction,
}: {
  actionData: LoginActionData | null | undefined;
  redirectTo?: string;
  formAction?: (formData: FormData) => void;
}) {
  const { t } = useTranslation();
  const { appConfiguration } = useRootData();
  const searchParams = useSearchParams();

  const emailInput = useRef<RefInputText>(null);
  
  useEffect(() => {
    if (appConfiguration.auth.authMethods.emailPassword.enabled) {
      setTimeout(() => {
        emailInput.current?.input.current?.focus();
      }, 300);
    }
  }, [appConfiguration.auth.authMethods.emailPassword.enabled]);
  
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center">
        <h1 className="text-left text-2xl font-extrabold">{t("account.login.headline")}</h1>
        <p className="mt-1 text-left">
          <Link href={appConfiguration.subscription.allowSignUpBeforeSubscribe ? "/register" : "/pricing"} className="text-primary font-medium hover:underline">
            {t("account.login.orRegister")}
          </Link>
        </p>
      </div>

      <div className="border-border mx-auto flex flex-col items-center space-y-6 rounded-lg border p-6">
        {/* <!-- SSO: START --> */}
        {(appConfiguration.auth.authMethods.github.enabled || appConfiguration.auth.authMethods.google.enabled) && (
          <>
            <div className="w-full space-y-3 text-center">
              {/* GitHub */}
              {appConfiguration.auth.authMethods.github.enabled && (
                <div>
                  <a
                    className="focus-visible:ring-ring inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors focus-visible:outline-hidden focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 dark:border dark:border-white/10"
                    href={appConfiguration.auth.authMethods.github.authorizationURL}
                  >
                    <GitHubIcon className="mr-2 h-4 w-4 text-white" /> {t("auth.github.button")}
                  </a>
                </div>
              )}
              {/* GitHub: End */}
              {/* Google */}
              {appConfiguration.auth.authMethods.google.enabled && (
                <form action="/oauth/google" method="post">
                  <button
                    type="submit"
                    className="focus-visible:ring-ring inline-flex h-9 w-full items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2e70d9] focus-visible:outline-hidden focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 dark:focus:ring-blue-700"
                  >
                    <GoogleIcon className="mr-2 h-4 w-4 text-white" /> {t("auth.google.button")}
                  </button>
                </form>
              )}
              {/* Google: End */}
            </div>

            {appConfiguration.auth.authMethods.emailPassword.enabled && (
              <div className="border-border w-full border-t-2 border-dotted dark:border-gray-900"></div>
            )}
          </>
        )}
        {/* <!-- SSO: END --> */}

        {appConfiguration.auth.authMethods.emailPassword.enabled && (
          <form action={formAction} method="post" className="w-full space-y-3">
            <LoginFormFields actionData={actionData} redirectTo={redirectTo} emailInput={emailInput} />
          </form>
        )}
      </div>
    </div>
  );
}
