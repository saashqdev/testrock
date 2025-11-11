export type BlacklistModel = {
  id: number;
  userId: number;
  reason: string;
  blacklistedAt: Date;
  blacklistedBy: string;
  expiresAt: Date | null;
};
