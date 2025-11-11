import { Feedback } from "@prisma/client";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import { UserDto } from "@/db/models/accounts/UsersModel";

export type FeedbackModel = {
  id: number;
  userId: number;
  message: string;
  rating: number; // e.g., 1 to 5
};

export type FeedbackWithDetailsDto = Feedback & {
  tenant: TenantDto | null;
  user: UserDto | null;
};
