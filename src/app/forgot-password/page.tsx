import crypto from "crypto";
import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { sendEmail } from "@/modules/emails/services/EmailService";
import { getBaseURL } from "@/utils/url.server";
import { getDefaultSiteTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import EmailTemplates from "@/modules/emails/utils/EmailTemplates";
import { db } from "@/db";
import ForgotPasswordForm from "./component";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();

  return {
    title: `${t("account.forgot.title")} | ${getDefaultSiteTags().title}`,
  };
}

type ActionData = {
  success?: string;
  error?: string;
};

async function forgotPasswordAction(prevState: ActionData | null, formData: FormData): Promise<ActionData> {
  "use server";
  
  const email = formData.get("email")?.toString();

  if (!email) {
    return {
      error: "Email required",
    };
  }

  const user = await db.users.getUserByEmail(email);
  // const ipError = await IpAddressServiceServer.log(request, {
  //   action: "forgot-password",
  //   description: email,
  //   block: user === null ? "User not found" : undefined,
  // }).catch((e) => e.message);
  // if (ipError) {
  //   return { error: ipError };
  // }
  if (!user) {
    // Do not show that the email was not found, fake wait
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { success: "Email sent" };
  }

  var verifyToken = crypto.randomBytes(20).toString("hex");
  await db.users.updateUserVerifyToken({ verifyToken }, user.id);
  await sendEmail({
    to: email,
    alias: "password-reset",
    ...EmailTemplates.PASSWORD_RESET_EMAIL.parse({
      appConfiguration: await db.appConfiguration.getAppConfiguration(),
      name: user.firstName,
      action_url: new URL(getBaseURL() + `/reset?e=${encodeURIComponent(email)}&t=${verifyToken}`).toString(),
    }),
  });

  return {
    success: "Email sent",
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm action={forgotPasswordAction} />;
}
