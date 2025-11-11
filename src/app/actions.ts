"use server";

import { PageBlockService } from "@/modules/pageBlocks/services/server/blocksService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

type ActionData = { error?: string; success?: string; authRequired?: boolean };

export async function handlePageAction(formData: FormData): Promise<ActionData> {
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

    const result = await PageBlockService.action(props);

    if (result instanceof Response) {
      const json = await result.json();
      return json;
    }

    return result as ActionData;
  } catch (error: any) {
    console.error("Page action error:", error);
    return { error: error.message || "An error occurred" };
  }
}
