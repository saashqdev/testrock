import { redirect } from "next/navigation";
import { getUserInfo } from "@/lib/services/session.server";
import Logo from "@/components/brand/Logo";
import { getServerTranslations } from "@/i18n/server";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import { db } from "@/db";
import LoginClient from "@/app/login/component";

export default async function LoginRoute() {
  const { t } = await getServerTranslations();

  // Check if user is already logged in
  const userInfo = await getUserInfo();
  if (userInfo.userId !== undefined && userInfo.userId !== "") {
    const user = await db.users.getUser(userInfo.userId);
    if (user) {
      if (!user?.defaultTenantId) {
        redirect("/app");
      } else {
        const tenant = await db.tenants.getTenant(user.defaultTenantId);
        if (tenant) {
          redirect(`/app/${tenant?.slug ?? tenant.id}`);
        }
      }
    }
  }

  // Get demo credentials if available
  const demoUser = process.env.DEMO_USER?.split(":");
  const demoCredentials = demoUser && demoUser.length > 1 ? { email: demoUser[0], password: demoUser[1] } : undefined;

  return (
    <div className="">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-5">
          <Logo className="mx-auto h-9" />

          <LoginClient demoCredentials={demoCredentials} />

          {demoCredentials && (
            <InfoBanner title="Guest Demo Account" text="">
              <b>email:</b>
              <span className="select-all">{demoCredentials.email}</span>, <b>password:</b>
              <span className="select-all">{demoCredentials.password}</span>.
            </InfoBanner>
          )}
        </div>
      </div>
    </div>
  );
}
