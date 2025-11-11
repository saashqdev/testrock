"use server";

import { db } from "@/db";
import { TenantDto, UserWithDetailsDto } from "@/db/models";
import { getUserInfo } from "@/lib/services/session.server";
import { getUser } from "@/modules/accounts/services/UserService";
import { redirect } from "next/navigation";
import Component from "./component";

export type AppIndexLoaderData = {
  user: UserWithDetailsDto;
  myTenants: TenantDto[];
};

const loader = async () => {
  const userInfo = await getUserInfo();
  if (!userInfo.userId) {
    throw redirect(`/login`);
  }
  const user = await getUser(userInfo.userId);
  if (!userInfo.userId || !user) {
    throw redirect(`/login`);
  }
  // Ensure user.admin is never undefined and include tenants/roles so it matches UserWithDetailsDto
  const userWithAdminFixed: UserWithDetailsDto = {
    ...(user as any),
    admin: user.admin === undefined ? null : user.admin,
    tenants: (user as any).tenants ?? [],
    roles: (user as any).roles ?? [],
  };
  const myTenants = await db.tenant.getMyTenants(userInfo.userId!);
  if (myTenants.length === 1) {
    return redirect("/app/" + encodeURIComponent(myTenants[0].slug) + "/dashboard");
  }
  // if (myTenants.length === 0 && user.admin) {
  //   return redirect("/admin");
  // }

  const data: AppIndexLoaderData = {
    user: userWithAdminFixed,
    myTenants,
  };
  return data;
};

export default async function () {
  const data = await loader();
  return <Component data={data} />;
}
