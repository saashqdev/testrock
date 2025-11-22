"use server";

import { action as serverAction, ActionData } from "./Contact.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function handleContactAction(formData: FormData): Promise<ActionData> {
  try {
    const request = new Request("http://localhost", {
      method: "POST",
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
    console.error("Contact action error:", error);
    return { error: error.message || "An error occurred" };
  }
}
