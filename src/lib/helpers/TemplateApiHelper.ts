import { TFunction } from "i18next";
import type { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import type { UserDto } from "@/db/models/accounts/UsersModel";
import type { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import TenantHelper from "./TenantHelper";

export type RowAsJson = {
  id: string;
  entityId: string;
  name: string;
  data: any;
  tenant: TenantWithDetailsDto | null;
};

export interface TemplateValueResultDto {
  variable: { [key: string]: string | number };
  row?: any;
  session: {
    user: { firstName: string; lastName: string; email: string; createdAt: Date } | null;
    tenant: { [key: string]: any } | null;
  };
  promptFlow?: {
    results: {
      [key: number]: string;
    };
  };
}
function getTemplateValue({
  allEntities,
  t,
  session,
  variables,
  row,
}: {
  allEntities: EntityWithDetailsDto[];
  t: TFunction;
  session: {
    user: UserDto | null;
    tenant: TenantWithDetailsDto | null;
  };
  variables: {
    [key: string]: string | number;
  };
  row: RowAsJson | undefined;
}): TemplateValueResultDto {
  const tenantSettingsEntity = allEntities.find((f) => f.name === "tenantSettings") ?? null;
  let object: TemplateValueResultDto = {
    variable: {},
    row: row ? {} : undefined,
    session: {
      user: !session.user
        ? null
        : {
            firstName: session.user!.firstName,
            lastName: session.user!.lastName,
            email: session.user!.email,
            createdAt: session.user!.createdAt,
          },
      tenant: !session.tenant ? null : TenantHelper.apiFormat({ tenant: session.tenant, subscriptions: null, tenantSettingsEntity, t }),
    },
    promptFlow: {
      results: [],
    },
  };

  if (Object.keys(variables).length > 0) {
    object.variable = variables;
  }

  if (row) {
    object.row = row.data;
  }

  return object;
}

export default {
  getTemplateValue,
};
