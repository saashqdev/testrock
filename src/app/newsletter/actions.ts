"use server";

import { action as serverAction, ActionData } from "./Newsletter.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { headers } from "next/headers";

export async function handleNewsletterAction(formData: FormData): Promise<ActionData> {
  try {
    // Get headers to construct a proper request with cookies for CSRF validation
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const url = `${protocol}://${host}/newsletter`;
    
    // Create request with headers (including cookies)
    const request = new Request(url, {
      method: "POST",
      headers: headersList,
      body: formData,
    });

    const props: IServerComponentsProps = {
      params: Promise.resolve({}),
      searchParams: Promise.resolve({}),
      request,
    };

    const result = await serverAction(props);

    if (result instanceof Response) {
      const json = await result.json();
      return json;
    }

    return result as ActionData;
  } catch (error: any) {
    console.error("Newsletter action error:", error);
    return { error: error.message || "An error occurred" };
  }
}
