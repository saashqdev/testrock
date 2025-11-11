export interface IRowCommentReactionDb {
  setRowCommentReaction(data: { createdByUserId: string; rowCommentId: string; reaction: string }): Promise<boolean>;
}
