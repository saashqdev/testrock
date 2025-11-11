import { NextRequest } from "next/server";
import { UserWithoutPasswordDto } from "@/db/models/accounts/UsersModel";
import { getAuthenticator } from "@/utils/auth/auth.server";
import { createUserSession, getUserInfo, setLoggedUser } from "@/lib/services/session.server";
import { GoogleProfile } from "next-auth/providers/google";
import { getServerTranslations } from "@/i18n/server";
import { isCompanyEmail } from "company-email-validator";
import { companyFromEmail } from "@/lib/helpers/EmailHelper";
import { validateRegistration } from "@/utils/services/authService";
import UrlUtils from "@/utils/app/UrlUtils";
import { db } from "@/db";

type ActionData = {
  error?: string;
};

const badRequest = (data: ActionData) => Response.json(data, { status: 400 });

export async function GET(request: NextRequest) {
  let profile = await getAuthenticator().authenticate("google", request, {
    failureRedirect: "/login",
  });
  const { id, emails } = profile as GoogleProfile;
  const email = emails[0]["value"];
  let user = await db.users.getUserByGoogleID(id);
  if (user) {
    return signInGoogleUser(request, user);
  } else {
    user = await db.users.getUserByEmail(email);
    if (user) {
      // we already have a user with this email -> Link the google account
      await db.users.setUserGoogleAccount({ googleId: id }, user.id);
      return signInGoogleUser(request, user);
    }
  }
  return signUpGoogleUser(request, profile as GoogleProfile);
}

const signInGoogleUser = async (request: NextRequest, user: UserWithoutPasswordDto) => {
  await db.logs.createLogLogin(request, user);
  const userInfo = await getUserInfo();
  const userSession = await setLoggedUser(user);
  const tenant = await db.tenants.getTenant(userSession.defaultTenantId);
  return createUserSession(
    {
      ...userInfo,
      ...userSession,
      lng: user.locale ?? userInfo.lng,
    },
    user.admin !== null ? "/admin/dashboard" : `/app/${tenant?.slug}/dashboard`
  );
};

const signUpGoogleUser = async (request: NextRequest, userProfile: GoogleProfile) => {
  const { t } = await getServerTranslations();
  const userInfo = await getUserInfo();
  const firstName = userProfile.given_name ?? "";
  const lastName = userProfile.family_name ?? "";
  const email = userProfile.emails?.[0]?.value ?? "";
  const avatarURL = userProfile.photos?.[0]?.value ?? "";
  let company;
  if (isCompanyEmail(email)) {
    // Use email as company
    company = companyFromEmail(email);
  } else {
    company = UrlUtils.slugify(firstName + " " + lastName);
  }
  const result = await validateRegistration({
    request,
    registrationData: {
      email: email,
      firstName: firstName,
      lastName: lastName,
      company: company,
      avatarURL: avatarURL,
    },
    checkEmailVerification: false,
    stripeCustomerId: undefined,
    githubId: undefined,
    googleId: userProfile.id,
    addToTrialOrFreePlan: true,
  });
  if (result.registered) {
    const userSession = await setLoggedUser(result.registered.user);
    return createUserSession(
      {
        ...userInfo,
        ...userSession,
        lng: result.registered.user.locale ?? userInfo.lng,
      },
      `/app/${encodeURIComponent(result.registered.tenant.slug)}/dashboard`
    );
  }
  return badRequest({ error: t("shared.unknownError") });
};
