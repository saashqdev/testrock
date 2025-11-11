import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { PromptBuilderVariableDto } from "./PromptBuilderVariableDto";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import { UserWithDetailsDto } from "@/db/models/accounts/UsersModel";

export type PromptBuilderDataDto = {
  variable: PromptBuilderVariableDto;
  text?: string;
  row?: {
    entity: EntityWithDetailsDto;
    item: RowWithDetailsDto;
  };
  tenant?: TenantWithDetailsDto;
  user?: UserWithDetailsDto;
};
