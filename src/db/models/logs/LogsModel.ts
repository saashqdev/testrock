import { Log, ApiKey, Tenant } from "@prisma/client";
import { UserWithoutPasswordDto } from "@/db/models/accounts/UsersModel";
import { RowCommentWithDetailsDto } from "@/db/models/entityBuilder/RowCommentsModel";

export type LogsModel = {
    id: string;
    createdAt: Date;
    tenantId: string | null;
    details: string | null;
    url: string;
    action: string;
    apiKeyId: string | null;
    userId: string | null;
    rowId: string | null;
    commentId: string | null;
}

export type LogWithDetailsDto = Log & {
  user: UserWithoutPasswordDto | null;
  apiKey: ApiKey | null;
  tenant?: Tenant | null;
  comment?: RowCommentWithDetailsDto | null;
};
