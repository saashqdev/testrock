import { UserWithoutPasswordDto } from "@/db/models/accounts/UsersModel";

export type ImpersonatingSessionDto = {
  fromUser: UserWithoutPasswordDto;
  toUser: UserWithoutPasswordDto;
};
