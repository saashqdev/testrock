import { RowComment } from "@prisma/client";
import { UserDto } from "@/db/models/accounts/UsersModel";
import { RowCommentReactionWithDetailsDto } from "@/db/models/entityBuilder/RowCommentReactionModel";

export type RowCommentModel = {
  text: string;
  authorId: string;
};

export type RowCommentWithDetailsDto = RowComment & {
  createdByUser: UserDto;
  reactions: RowCommentReactionWithDetailsDto[];
  // replies: (RowComment & { createdByUser: User })[];
};
