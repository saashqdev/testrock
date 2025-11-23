import { getDefaultSiteTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { prisma } from "@/db/config/prisma/database";
import { db } from "@/db";
import Component from "./component";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("models.ipAddress.plural")} Logs | ${getDefaultSiteTags().title}`,
  };
}

export default async function IpAddressLogsPage(props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.tenantIpAddress.view");
  const searchParams = await props.searchParams;

  const urlSearchParams = new URLSearchParams(searchParams as Record<string, string>);
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await db.ipAddressLogs.getAllIpAddressLogs(currentPagination);

  const blacklistedIps = await prisma.blacklist
    .findMany({
      where: { type: "ip" },
      select: { value: true },
    })
    .then((items) => items.flatMap((i) => i.value));

  return <Component items={items} pagination={pagination} blacklistedIps={blacklistedIps} />;
}
