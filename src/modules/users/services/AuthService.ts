import { getServerTranslations } from "@/i18n/server";
import UserUtils from "@/utils/app/UserUtils";
import { setLoggedUser, createUserSession, getUserInfo, validateCSRFToken } from "@/lib/services/session.server";
import bcrypt from "bcryptjs";
import { getRegistrationFormData, validateRegistration, createRegistrationForm } from "@/utils/services/authService";
import { Params } from "@/types";
import { db } from "@/db";
import IpAddressServiceServer from "@/modules/ipAddress/services/IpAddressService.server";

async function getHome({ isAdmin, tenantId, request }: { isAdmin: boolean; tenantId: string; request: Request }) {
  let appHome = "";
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (isAdmin) {
    appHome = "/admin/dashboard";
  } else if (appConfiguration.app.features.tenantHome === "/app/:tenant/") {
    const tenant = await db.tenants.getTenant(tenantId);
    if (tenant) {
      appHome = `/app/${encodeURIComponent(tenant.slug)}/dashboard`;
    } else {
      appHome = "/app";
    }
  } else {
    appHome = "/";
  }
  return appHome;
}

async function loginFromRequest(request: Request, form: FormData) {
  const userInfo = await getUserInfo();
  const { t } = await getServerTranslations();
  const email = form.get("email")?.toString().toLowerCase().trim();
  const password = form.get("password");
  const redirectTo = form.get("redirectTo");
  if (typeof email !== "string" || typeof password !== "string" || typeof redirectTo !== "string") {
    throw new Error("Invalid form data");
  }

  const fields = { email, password };
  const fieldErrors = {
    email: !UserUtils.validateEmail(email) ? "Invalid email" : undefined,
    password: !UserUtils.validatePassword(password) ? "Invlaid password" : undefined,
  };
  if (Object.values(fieldErrors).some(Boolean)) throw Response.json({ fieldErrors, fields }, { status: 400 });

  const user = await db.users.getUserByEmail(email);
  if (process.env.NODE_ENV !== "development") {
    const ipError = await IpAddressServiceServer.log(request, { action: "login", description: email }).catch((e) => e.message);
    if (ipError) {
      return Response.json({ error: ipError }, { status: 400 });
    }

    const testAccounts = ["admin@email.com", "john.doe@company.com", "luna.davis@company.com", "alex.martinez@company.com"];
    if (testAccounts.includes(email)) {
      return Response.json({ fields: { email, password }, error: "You cannot use this account in production." }, { status: 400 });
    }
  }
  if (!user) {
    return Response.json({ fields, error: t("api.errors.invalidPassword") }, { status: 400 });
  }

  const passwordHash = await db.users.getPasswordHash(user.id);
  if (!passwordHash) {
    return Response.json({ fields, error: t("api.errors.invalidPassword") }, { status: 400 });
  }

  const isCorrectPassword = await bcrypt.compare(password, passwordHash);
  if (!isCorrectPassword) {
    return Response.json({ fields, error: t("api.errors.invalidPassword") }, { status: 400 });
  }

  await db.logs.createLogLogin(request, user);
  const userSession = await setLoggedUser(user);
  // const tenant = await getTenant(userSession.defaultTenantId);
  const appHome = await getHome({
    isAdmin: !!user.admin,
    tenantId: userSession.defaultTenantId,
    request,
  });
  return createUserSession(
    {
      ...userInfo,
      ...userSession,
      lng: user.locale ?? userInfo.lng,
    },
    redirectTo.length > 0 ? redirectTo : appHome
  );
}

async function registerFromRequest(request: Request) {
  const { t } = await getServerTranslations();
  const userInfo = await getUserInfo();
  try {
    await validateCSRFToken(request);
    const registrationData = await getRegistrationFormData(request);
    const result = await validateRegistration({ request, registrationData, addToTrialOrFreePlan: true });
    if (result.verificationRequired) {
      await createRegistrationForm({ ...registrationData, email: result.email, ipAddress: result.ipAddress, recreateToken: false, request });
      return Response.json({ verificationEmailSent: true });
    } else if (result.registered) {
      const userSession = await setLoggedUser(result.registered.user);
      const home = await getHome({
        isAdmin: false,
        tenantId: userSession.defaultTenantId,
        request,
      });
      return createUserSession(
        {
          ...userInfo,
          ...userSession,
          lng: result.registered.user.locale ?? userInfo.lng,
        },
        home
      );
    }
    return Response.json({ error: t("shared.unknownError") }, { status: 400 });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log(e.message);
    return Response.json({ error: t(e.message) }, { status: 400 });
  }
}

async function verifyFromRequest({ request, params }: { request: Request; params: Params }) {
  const { t } = await getServerTranslations();
  const userInfo = await getUserInfo();

  const token = typeof params.id === "string" ? params.id : "";
  const registration = await db.registration.getRegistrationByToken(token);
  if (!registration || registration.createdTenantId) {
    return Response.json({ error: t("api.errors.userAlreadyRegistered") }, { status: 400 });
  }

  try {
    const registrationData = await getRegistrationFormData(request);
    const result = await validateRegistration({ request, registrationData, checkEmailVerification: false, addToTrialOrFreePlan: true });
    if (!result.registered) {
      return Response.json({ error: t("shared.unknownError") }, { status: 400 });
    }
    const userSession = await setLoggedUser(result.registered.user);
    const appHome = await getHome({
      isAdmin: false,
      tenantId: userSession.defaultTenantId,
      request,
    });
    return createUserSession(
      {
        ...userInfo,
        ...userSession,
        lng: result.registered.user.locale ?? userInfo.lng,
      },
      appHome
    );
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}

export default {
  loginFromRequest,
  registerFromRequest,
  verifyFromRequest,
};
