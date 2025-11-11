import { Credit } from "@prisma/client";
import { TenantDto, UserDto } from "@/db/models";

export type CreditsWithDetailsDto = Credit & {
  tenant: TenantDto;
  user: UserDto | null;
};
