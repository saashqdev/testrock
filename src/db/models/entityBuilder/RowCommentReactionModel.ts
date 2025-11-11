import { RowCommentReaction } from "@prisma/client";
import { UserDto } from "@/db/models/accounts/UsersModel";

export type RowCommentReactionModel = {
  type: "like" | "dislike" | "love" | "laugh" | "sad" | "angry";
  userId: string;
};

export type RowCommentReactionWithDetailsDto = RowCommentReaction & {
  createdByUser: UserDto;
};
