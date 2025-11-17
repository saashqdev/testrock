import { loader, action } from "@/modules/rows/routes/Rows_New.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, props: IServerComponentsProps) {
  return await loader({ ...props, request });
}

export async function POST(request: NextRequest, props: IServerComponentsProps) {
  return await action({ ...props, request });
}
