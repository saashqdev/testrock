import CryptoApi from "@/utils/api/server/CryptoApi";
import { db } from "@/db";

async function getCredentialsContext({
  tenantId,
  appliesToAllTenants,
}: {
  tenantId: string | null;
  appliesToAllTenants: boolean | undefined;
}): Promise<{ [key: string]: string }> {
  let credentials: { [key: string]: string } = {};

  if (appliesToAllTenants && tenantId) {
    const adminItems = await db.workflowCredentials.getAllWorkflowCredentials({ tenantId: null });
    adminItems.forEach((item) => {
      const value = CryptoApi.decrypt(item.value);
      credentials[item.name] = value;
    });
  }

  const items = await db.workflowCredentials.getAllWorkflowCredentials({ tenantId });
  items.forEach((item) => {
    const value = CryptoApi.decrypt(item.value);
    credentials[item.name] = value;
  });

  return credentials;
}

async function getVariablesContext({
  tenantId,
  appliesToAllTenants,
}: {
  tenantId: string | null;
  appliesToAllTenants: boolean | undefined;
}): Promise<{ [key: string]: string }> {
  let variables: { [key: string]: string } = {};

  if (appliesToAllTenants && tenantId) {
    const adminItems = await db.workflowVariable.getAllWorkflowVariables({ tenantId: null });
    adminItems.forEach((item) => {
      variables[item.name] = item.value;
    });
  }

  const items = await db.workflowVariable.getAllWorkflowVariables({ tenantId });
  items.forEach((item) => {
    variables[item.name] = item.value;
  });
  return variables;
}

export default {
  getCredentialsContext,
  getVariablesContext,
};
