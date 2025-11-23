import { redirect } from "next/navigation";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { TenantTypeWithDetailsDto } from "@/db/models/accounts/TenantTypesModel";
import { verifyUserHasPermission } from "@/modules/permissions/services/UserPermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { TenantTypeFormWrapper } from "./TenantTypeFormWrapper";

type LoaderData = {
  item: TenantTypeWithDetailsDto;
  allSubscriptionProducts: SubscriptionProductDto[];
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.accountTypes.update");
  const item = await db.tenantTypes.getTenantType(params.id!);
  if (!item) {
    redirect("/admin/settings/accounts/types");
  }
  const data: LoaderData = {
    item,
    allSubscriptionProducts: await db.subscriptionProducts.getAllSubscriptionProducts(),
  };
  return data;
}

export default async function Page(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const data = await getData(props);

  return <TenantTypeFormWrapper item={data.item} allSubscriptionProducts={data.allSubscriptionProducts} id={params.id!} />;
}
