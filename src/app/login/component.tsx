"use client";

import { useRootData } from "@/lib/state/useRootData";
import LoginForm from "@/modules/users/components/LoginForm";
import { loginAction } from "@/app/login/actions";
import { useActionState } from "react";
import { LoginActionData } from "@/modules/users/components/LoginForm";

export default function LoginClient({ demoCredentials }: { demoCredentials?: { email: string; password: string } }) {
  const { appConfiguration } = useRootData();
  const [actionData, formAction] = useActionState<LoginActionData | null, FormData>(loginAction, null);

  return <LoginForm actionData={actionData} redirectTo={appConfiguration.app.features.tenantHome === "/" ? "/" : undefined} formAction={formAction} />;
}
