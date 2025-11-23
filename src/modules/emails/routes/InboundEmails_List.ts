import { loaderEmails, LoaderDataEmails } from "../loaders/inbound-emails";
import { actionInboundEmails, ActionDataEmails } from "../actions/inbound-emails";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export type LoaderData = LoaderDataEmails;
export type ActionData = ActionDataEmails;

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const tenantId = await getTenantIdFromUrl(params);
  return await loaderEmails(props, tenantId);
};

export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const tenantId = await getTenantIdFromUrl(params);
  return await actionInboundEmails(props, tenantId);
};
