import { TFunction } from "i18next";
import { UserSession } from "@/lib/services/session.server";
import { PageConfiguration } from "./PageConfiguration";

export type PageLoaderData = PageConfiguration & {
  userSession: UserSession;
  authenticated: boolean;
  // i18n: Record<string, Language>;
  t: TFunction;
};

// Helper type to remove non-serializable functions for client components
export type PageClientData = Omit<PageLoaderData, "t">;

// Helper function to strip non-serializable data before passing to client components
export function toClientData(data: PageLoaderData): PageClientData {
  const { t, ...clientData } = data;
  return clientData;
}
