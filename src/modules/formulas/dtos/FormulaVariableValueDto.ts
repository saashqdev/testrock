import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import { UserWithDetailsDto } from "@/db/models/accounts/UsersModel";

export type FormulaVariableValueDto = {
  plain?: {
    variable: string;
    textValue?: string | undefined;
    numberValue?: number | undefined;
    dateValue?: Date | undefined;
    booleanValue?: boolean | undefined;
  };
  row?: {
    entity: EntityWithDetailsDto;
    item: RowWithDetailsDto;
  };
  tenant?: TenantWithDetailsDto;
  user?: UserWithDetailsDto;
};
