import { Event } from "@prisma/client";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import { UserDto } from "@/db/models/accounts/UsersModel";

export type EventWithAttemptsDto = Event & {
  tenant: TenantDto | null;
  user: UserDto | null;
  // attempts: {
  //   id: string;
  //   startedAt: Date | null;
  //   finishedAt: Date | null;
  //   endpoint: string;
  //   success: boolean | null;
  //   status: number | null;
  //   message: string | null;
  // }[];
};

export type EventWithDetailsDto = Event & {
  tenant: TenantDto | null;
  user: UserDto | null;
  // attempts: EventWebhookAttempt[];
};
