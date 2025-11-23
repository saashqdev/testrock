import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import Logo from "@/components/brand/Logo";
import { getServerTranslations } from "@/i18n/server";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type PageProps = IServerComponentsProps;

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("shared.deactivated")} | ${process.env.APP_NAME}`,
  };
}

async function getData(props: PageProps): Promise<{ currentTenant: TenantWithDetailsDto }> {
  const params = (await props.params) || {};
  const tenantId = await getTenantIdFromUrl(params);
  const currentTenant = await db.tenants.getTenant(tenantId);
  if (!currentTenant) {
    redirect(`/app`);
  }
  if (!currentTenant.deactivatedReason) {
    redirect(`/app/${currentTenant.slug}/dashboard`);
  }
  return {
    currentTenant,
  };
}

export default async function TenantDeactivatedRoute(props: PageProps) {
  const { t } = await getServerTranslations();
  const { currentTenant } = await getData(props);
  return (
    <>
      <div className="">
        <div className="flex min-h-full flex-col pb-12 pt-16">
          <main className="mx-auto flex w-full max-w-7xl grow flex-col justify-center px-4 sm:px-6 lg:px-8">
            <div className="flex shrink-0 justify-center">
              <Logo />
            </div>
            <div className="py-16">
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{currentTenant.name}</p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-5xl">{t("shared.deactivated")}</h1>
                <p className="mt-2 text-lg text-muted-foreground">{currentTenant.deactivatedReason}</p>
                <div className="mt-4 flex">
                  <Link href="." className="w-full text-center text-sm font-medium text-primary hover:text-primary/90 hover:underline">
                    Reload
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
