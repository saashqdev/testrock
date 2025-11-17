import bcrypt from "bcryptjs";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { getDefaultSiteTags } from "@/modules/pageBlocks/utils/defaultSeoMetaTags";
import EventsService from "@/modules/events/services/server/EventsService";
import { UserPasswordUpdatedDto } from "@/modules/events/dtos/UserPasswordUpdatedDto";
import IpAddressServiceServer from "@/modules/ipAddress/services/IpAddressService.server";
import { createUserSession, getUserInfo } from "@/lib/services/session.server";
import UserUtils from "@/utils/app/UserUtils";
import { db } from "@/db";
import ResetPasswordForm from "./component";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();

  return {
    title: `${t("account.reset.title")} | ${getDefaultSiteTags().title}`,
  };
}

type ActionData = {
  success?: string;
  error?: string;
};

async function resetPasswordAction(prevState: ActionData | null, formData: FormData): Promise<ActionData | null> {
  "use server";

  try {
    const { t } = await getServerTranslations();

    const email = formData.get("email")?.toString() ?? "";
    const verifyToken = formData.get("verify-token")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const passwordConfirm = formData.get("password-confirm")?.toString() ?? "";

    if (!email) {
      return { error: "Email required" };
    }

    const passwordError = UserUtils.validatePasswords({ t, password, passwordConfirm });
    if (passwordError) {
      return { error: passwordError };
    }

    const user = await db.users.getUserByEmail(email);
    if (!user) {
      return { error: t("api.errors.userNotRegistered") };
    }

    if (!user.verifyToken || !verifyToken || user.verifyToken !== verifyToken) {
      return { error: "Invalid token, reset your password first" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.users.updateUserPassword({ passwordHash }, user.id);
    
    // Note: EventsService.create expects a request object, but we don't have it in server actions
    // You may need to modify EventsService or skip this event logging
    // await EventsService.create({
    //   request,
    //   event: "user.password.updated",
    //   tenantId: null,
    //   userId: user.id,
    //   data: {
    //     user: { id: user.id, email: user.email },
    //   } satisfies UserPasswordUpdatedDto,
    // });

    const userInfo = await getUserInfo();
    
    // Create session and redirect (redirect is called internally and throws)
    await createUserSession(
      {
        ...userInfo,
        userId: user.id,
        lng: user.locale ?? userInfo.lng,
      },
      "/app"
    );

    return null;
  } catch (error: any) {
    console.error("Reset password action error:", error);
    
    // Handle redirect thrown by Next.js - let it propagate
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    
    return {
      error: error.message || "An error occurred during password reset",
    };
  }
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string }>;
}) {
  return <ResetPasswordForm action={resetPasswordAction} searchParams={searchParams} />;
}
