import { action } from "@/modules/pageBlocks/routes/pages/PageMetaTags_Index";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, props: IServerComponentsProps) {
  try {
    return await action({ ...props, request });
  } catch (error: any) {
    // Handle any errors and return JSON
    console.error('API route error:', error);
    return Response.json({ error: error.message || 'An error occurred' }, { status: 500 });
  }
}
