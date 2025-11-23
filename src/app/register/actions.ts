"use server";

import AuthService from "@/modules/users/services/AuthService";

type ActionData = {
  error?: string;
  verificationEmailSent?: boolean;
};

export async function registerAction(prevState: ActionData | null, formData: FormData): Promise<ActionData> {
  const request = new Request("http://localhost", {
    method: "POST",
    body: formData,
  });

  const result = await AuthService.registerFromRequest(request);

  if (result instanceof Response) {
    const data = await result.json();
    return data;
  }

  return { error: "Unknown error occurred" };
}
