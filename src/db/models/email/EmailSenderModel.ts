import { EmailSender } from "@prisma/client";

export type EmailSenderModel = {
  id: string;
  email: string;
  name?: string;
};

export type EmailSenderWithoutApiKeyDto = Omit<EmailSender, "apiKey">;
