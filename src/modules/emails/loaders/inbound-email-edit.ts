import { EmailRead } from "@prisma/client";
import { redirect } from "next/navigation";
import { EmailWithDetailsDto } from "@/db/models/email/EmailsModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getUserInfo } from "@/lib/services/session.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderDataInboundEmailEdit = {
  item: EmailWithDetailsDto;
  myRead: EmailRead;
  redirectUrl: string;
};
export const loaderEmailEdit = async (props: IServerComponentsProps, tenantId: string | null, redirectUrl: string) => {
  const params = (await props.params) || {};
  await requireAuth();
  const userInfo = await getUserInfo();
  const item = await db.emails.getEmail(params.id ?? "", tenantId);
  if (!item) {
    throw redirect(redirectUrl);
  }
  const myReads = await db.emails.getEmailReads(params.id ?? "", userInfo.userId);
  let myRead: EmailRead | null = null;
  if (myReads.length === 0) {
    myRead = await db.emails.createEmailRead(item.id, userInfo.userId);
  } else {
    myRead = myReads[0];
  }
  const data: LoaderDataInboundEmailEdit = {
    item,
    myRead,
    redirectUrl,
  };
  return data;
};
