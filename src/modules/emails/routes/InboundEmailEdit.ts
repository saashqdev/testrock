import { loaderEmailEdit, LoaderDataInboundEmailEdit } from "../loaders/inbound-email-edit";
import { actionInboundEmailEdit, ActionDataEmails } from "../actions/inbound-email-edit";
import UrlUtils from "@/utils/app/UrlUtils";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export type LoaderData = LoaderDataInboundEmailEdit;
export type ActionData = ActionDataEmails;

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  const tenantId = await getTenantIdFromUrl(params);
  return await loaderEmailEdit(props, tenantId, UrlUtils.currentTenantUrl(params, "emails"));
};

export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  return await actionInboundEmailEdit(props, UrlUtils.currentTenantUrl(params, "emails"));
};

