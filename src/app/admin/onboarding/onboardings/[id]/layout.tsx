import { redirect } from "next/navigation";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import LayoutClient from "./LayoutClient";

type LayoutData = {
  item: OnboardingWithDetailsDto;
};

async function getData(props: IServerComponentsProps): Promise<LayoutData> {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.onboarding.update");
  const item = await db.onboarding.getOnboarding(params.id!);
  if (!item) {
    redirect("/admin/onboarding/onboardings");
  }
  return { item };
}

export default async function OnboardingLayout({ children, ...props }: IServerComponentsProps & { children: React.ReactNode }) {
  const data = await getData(props);

  return <LayoutClient item={data.item}>{children}</LayoutClient>;
}
