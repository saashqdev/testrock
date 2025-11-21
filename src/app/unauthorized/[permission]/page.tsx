import { redirect } from "next/navigation";
import { Metadata } from "next";
import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import Logo from "@/components/brand/Logo";
import { getServerTranslations } from "@/i18n/server";
import { getUserPermission } from "@/lib/helpers/server/PermissionsService";
import { getUserInfo } from "@/lib/services/session.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import UnauthorizedClient from "./UnauthorizedClient";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("shared.unauthorized")} | ${process.env.APP_NAME}`,
  };
}

export default async function UnauthorizedPermissionPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const searchParams = await props.searchParams;
  const { t } = await getServerTranslations();
  const permission = await db.permissions.getPermissionName(params.permission ?? "");
  const redirectTo = searchParams?.redirect?.toString();
  const userInfo = await getUserInfo();
  
  if (redirectTo) {
    if (!permission) {
      redirect(redirectTo);
    }
    const { userPermission } = await getUserPermission({ userId: userInfo.userId, permissionName: permission.name });
    if (userPermission) {
      // redirect(redirectTo);
    }
  } else if (!permission) {
    redirect("/404?error=permission-not-found");
  }

  const user = await db.users.getUser(userInfo.userId);

  return (
    <>
      <div className="">
        <div className="flex min-h-full flex-col pb-12 pt-16">
          <main className="mx-auto flex w-full max-w-7xl grow flex-col justify-center px-4 sm:px-6 lg:px-8">
            <div className="flex shrink-0 justify-center">
              <Logo />
            </div>
            <div className="mx-auto py-16">
              <div className="text-center">
                <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">{t("shared.unauthorized")}</h1>
                <p className="text-muted-foreground mt-2 text-base">Contact your admin and verify your permissions.</p>
                <div className="text-muted-foreground mx-auto mt-2 w-96 text-left text-base">
                  <div className="border-border bg-secondary flex justify-start space-y-2 border border-dashed p-4 dark:border-gray-700 dark:bg-gray-900">
                    <div className="space-y-2">
                      <div className="font-bold">{permission.description}</div>
                      <div>
                        <span>Permission &rarr;</span> <span className=" font-light italic">{permission.name}</span>
                      </div>
                    </div>
                  </div>
                  <UnauthorizedClient user={user} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <FooterBlock />
    </>
  );
}
