"use server";

import { getUserInfo, createUserSession } from "@/lib/services/session.server";

export async function actionNewsletter(
  prevState: { success: string | null; error: string | null },
  formData: FormData
): Promise<{ success: string | null; error: string | null }> {
  try {
    const email = formData.get("email") as string;
    const firstName = formData.get("first_name") as string;
    const lastName = formData.get("last_name") as string;
    const source = formData.get("source") as string;

    if (!email || !firstName || !lastName) {
      return {
        error: "All fields are required",
        success: null,
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        error: "Please enter a valid email address",
        success: null,
      };
    }

    // Here you would typically save to database or send to email service
    // For now, we'll just simulate success
    console.log("Newsletter subscription:", { email, firstName, lastName, source });

    return {
      success: "Thank you for subscribing to our newsletter!",
      error: null,
    };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return {
      error: "Something went wrong. Please try again.",
      success: null,
    };
  }
}

export async function actionToggleScheme(formData: FormData) {
  const redirectTo = formData.get("redirectTo") as string;
  const userInfo = await getUserInfo();
  userInfo.scheme = userInfo.scheme === "light" ? "dark" : "light";
  return await createUserSession(userInfo, redirectTo || "/");
}

export async function actionSetTheme(formData: FormData) {
  const redirectTo = formData.get("redirectTo") as string;
  const userInfo = await getUserInfo();
  return await createUserSession(
    {
      ...userInfo,
      theme: formData.get("theme") as string,
    },
    redirectTo || "/"
  );
  // return redirect(redirectTo || "/");
}

export async function actionLogout(formData: FormData) {
  console.log("logout");
  const userInfo = await getUserInfo();
  return await createUserSession(
    {
      ...userInfo,
      userId: "",
    },
    "/"
  );
  // return redirect("/");
}
