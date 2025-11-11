import { ApiKey } from "@prisma/client";
import { db } from "@/db";
import { UserWithoutPasswordDto } from "@/db/models/accounts/UsersModel";

export async function getRowUserOrApiKey(data: { userId?: string | null; apiKeyId?: string | null }) {
  // Event: RowCreated
  let createdByUser: UserWithoutPasswordDto | null = null;
  let createdByApiKey: ApiKey | null = null;
  let user: any = undefined;
  let apiKey: any = undefined;
  if (data.userId) {
    createdByUser = await db.users.getUser(data.userId);
    user = { id: createdByUser?.id, email: createdByUser?.email ?? "" };
  }
  if (data.apiKeyId) {
    createdByApiKey = await db.apiKeys.getApiKeyById(data.apiKeyId);
    apiKey = { id: createdByApiKey?.id, email: createdByApiKey?.alias ?? "" };
  }
  return {
    user,
    apiKey,
  };
}
