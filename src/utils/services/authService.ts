import { TenantUserType } from "@/lib/enums/tenants/TenantUserType";
import { getServerTranslations } from "@/i18n/server";
import UserUtils from "@/utils/app/UserUtils";
import { sendEmail } from "@/modules/emails/services/EmailService";
import { createStripeCustomer } from "@/utils/stripe.server";
import crypto from "crypto";
import { getClientIPAddress } from "@/utils/server/IpUtils";
import { getBaseURL } from "@/utils/url.server";
import { getUserInfo } from "@/lib/services/session.server";
import { setTenantTypes } from "@/utils/api/server/TenantTypesApi";
import EventsService from "@/modules/events/services/server/EventsService";
import { AccountCreatedDto } from "@/modules/events/dtos/AccountCreatedDto";
import { autosubscribeToTrialOrFreePlan } from "./server/pricingService";
import IpAddressServiceServer from "@/modules/ipAddress/services/IpAddressService.server";
import { db } from "@/db";
import EmailTemplates from "@/modules/emails/utils/EmailTemplates";

export type RegistrationData = {
  email?: string;
  password?: string;
  company?: string;
  firstName?: string;
  lastName?: string;
  avatarURL?: string;
  slug?: string;
};

export async function getRegistrationFormData(request: Request): Promise<RegistrationData> {
  const formData = await request.formData();
  const email = formData.get("email")?.toString().toLowerCase().trim();
  const password = formData.get("password")?.toString();
  const company = formData.get("company")?.toString();
  const firstName = formData.get("first-name")?.toString();
  const lastName = formData.get("last-name")?.toString();
  const slug = formData.get("slug")?.toString();

  const ipError = await IpAddressServiceServer.log(request, {
    action: "register",
    description: email ?? "{empty email}",
    metadata: { email, company, firstName, lastName, slug },
  }).catch((e) => e.message);
  if (ipError) {
    throw Error(ipError);
  }

  return { email, password, company, firstName, lastName, slug };
}

export async function validateRegistration({
  request,
  registrationData,
  addToTrialOrFreePlan,
  checkEmailVerification = true,
  stripeCustomerId,
  githubId,
  googleId,
}: {
  request: Request;
  registrationData: RegistrationData;
  addToTrialOrFreePlan: boolean;
  checkEmailVerification?: boolean;
  stripeCustomerId?: string;
  githubId?: string;
  googleId?: string;
}) {
  const { t } = await getServerTranslations();
  const userInfo = await getUserInfo();
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  const { email, password, company, firstName, lastName, avatarURL, slug } = registrationData;
  if (!email || !UserUtils.validateEmail(email)) {
    throw Error(t("account.register.errors.invalidEmail"));
  }
  if (!githubId && !googleId) {
    if (!appConfiguration.auth.requireEmailVerification && !UserUtils.validatePassword(password)) {
      throw Error(t("account.register.errors.passwordRequired"));
    } else if (appConfiguration.auth.requireOrganization && typeof company !== "string") {
      throw Error(t("account.register.errors.organizationRequired"));
    } else if (appConfiguration.auth.requireName && (typeof firstName !== "string" || typeof lastName !== "string")) {
      throw Error(t("account.register.errors.nameRequired"));
    }
  }

  if (company && company.length > 100) {
    throw Error("Maximum length for company name is 100 characters");
  } else if (firstName && firstName.length > 50) {
    throw Error("Maximum length for first name is 50 characters");
  } else if (lastName && lastName.length > 50) {
    throw Error("Maximum length for last name is 50 characters");
  }

  const ipAddress = getClientIPAddress(request.headers)?.toString() ?? "";
  // eslint-disable-next-line no-console
  console.log("[REGISTRATION ATTEMPT]", { email, domain: email.substring(email.lastIndexOf("@") + 1), ipAddress });

  const blacklistedEmail = await db.blacklist.findInBlacklist("email", email);
  if (blacklistedEmail) {
    await db.blacklist.addBlacklistAttempt(blacklistedEmail);
    throw Error(t("account.register.errors.blacklist.email"));
  }
  const blacklistedDomain = await db.blacklist.findInBlacklist("domain", email.substring(email.lastIndexOf("@") + 1));
  if (blacklistedDomain) {
    await db.blacklist.addBlacklistAttempt(blacklistedDomain);
    throw Error(t("account.register.errors.blacklist.domain"));
  }
  const blacklistedIp = await db.blacklist.findInBlacklist("ip", ipAddress);
  if (blacklistedIp) {
    await db.blacklist.addBlacklistAttempt(blacklistedIp);
    throw Error(t("account.register.errors.blacklist.ip"));
  }

  const existingUser = await db.users.getUserByEmail(email);
  if (existingUser) {
    throw Error(t("api.errors.userAlreadyRegistered"));
  }

  if (appConfiguration.auth.slug?.require) {
    if (!slug) {
      throw Error(appConfiguration.auth.slug.type === "tenant" ? "Slug is required" : "Username is required");
    }
    const existingTenant = await db.tenants.getTenantBySlug(slug);
    if (existingTenant) {
      throw Error(appConfiguration.auth.slug.type === "tenant" ? "Slug is already taken" : "Username is already taken");
    }
  }
  if (checkEmailVerification && appConfiguration.auth.requireEmailVerification) {
    return { email, ipAddress, verificationRequired: true };
  }
  const locale = userInfo.lng;
  const registered = await createUserAndTenant({
    request,
    email,
    password,
    company,
    firstName,
    lastName,
    stripeCustomerId,
    githubId,
    googleId,
    avatarURL,
    locale,
    slug,
  });
  if (addToTrialOrFreePlan) {
    await autosubscribeToTrialOrFreePlan({ request, t, tenantId: registered.tenant.id, userId: registered.user.id });
  }
  return { email, ipAddress, verificationRequired: false, registered };
}

interface CreateRegistrationFormDto {
  request: Request;
  email: string;
  ipAddress: string;
  company?: string;
  firstName?: string;
  lastName?: string;
  recreateToken?: boolean;
  slug?: string;
}
export async function createRegistrationForm({ request, email, company, firstName, lastName, ipAddress, recreateToken, slug }: CreateRegistrationFormDto) {
  const registration = await db.registration.getRegistrationByEmail(email);
  if (registration) {
    if (registration.createdTenantId) {
      throw Error("api.errors.userAlreadyRegistered");
    } else {
      if (recreateToken) {
        const newToken = crypto.randomBytes(20).toString("hex");
        await db.registration.updateRegistration(registration.id, {
          firstName,
          lastName,
          company,
          token: newToken,
        });
        await sendEmail({
          to: email,
          alias: "email-verification",
          ...EmailTemplates.VERIFICATION_EMAIL.parse({
            appConfiguration: await db.appConfiguration.getAppConfiguration(),
            action_url: getBaseURL() + `/verify/` + newToken,
            name: firstName ?? "",
          }),
        });
      }
    }
  } else {
    var token = crypto.randomBytes(20).toString("hex");
    await db.registration.createRegistration({
      email,
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      company: company ?? "",
      token,
      selectedSubscriptionPriceId: null,
      ipAddress,
      slug: slug ?? null,
    });
    await sendEmail({
      to: email,
      alias: "email-verification",
      ...EmailTemplates.VERIFICATION_EMAIL.parse({
        appConfiguration: await db.appConfiguration.getAppConfiguration(),
        action_url: getBaseURL() + `/verify/` + token,
        name: firstName ?? "",
      }),
    });
  }
}

interface CreateUserAndTenantDto {
  request: Request;
  email: string;
  password?: string;
  company?: string;
  firstName?: string;
  lastName?: string;
  stripeCustomerId?: string;
  githubId?: string;
  googleId?: string;
  avatarURL?: string;
  locale?: string;
  slug?: string;
}
export async function createUserAndTenant({
  request,
  email,
  password,
  company,
  firstName,
  lastName,
  stripeCustomerId,
  githubId,
  googleId,
  avatarURL,
  locale,
  slug,
}: CreateUserAndTenantDto) {
  let tenantName = company ?? email.split("@")[0];
  if (!stripeCustomerId && process.env.STRIPE_SK) {
    const stripeCustomer = await createStripeCustomer(email, tenantName);
    if (!stripeCustomer) {
      throw Error("Could not create Stripe customer");
    }
    stripeCustomerId = stripeCustomer.id;
  }
  const tenant = await db.tenants.createTenant({ name: tenantName, subscriptionCustomerId: stripeCustomerId, slug });
  if (!tenant) {
    throw Error("Could not create tenant");
  }
  const user = await db.users.register({
    email: email,
    username: email.split("@")[0],
    password: password ?? "",
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    githubId,
    googleId,
    avatarURL,
    locale,
    defaultTenantId: tenant.id,
    request,
  });
  if (!user) {
    throw Error("Could not create user");
  }
  const roles = await db.roles.getAllRoles("app");
  await db.tenants.createTenantUser(
    {
      tenantId: tenant.id,
      userId: user.id,
      type: TenantUserType.OWNER,
    },
    roles
  );
  await setTenantTypes({ tenantId: tenant.id });

  await sendEmail({
    to: email,
    alias: "welcome",
    ...EmailTemplates.WELCOME_EMAIL.parse({
      appConfiguration: await db.appConfiguration.getAppConfiguration(),
      action_url: getBaseURL() + `/login`,
      name: firstName,
    }),
  });

  await EventsService.create({
    request,
    event: "account.created",
    tenantId: tenant.id,
    userId: user.id,
    data: {
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
      user: { id: user.id, email: user.email },
    } satisfies AccountCreatedDto,
  });

  return { user, tenant };
}
