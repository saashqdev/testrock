import { Rows_List } from "@/modules/rows/routes/Rows_List.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, props: IServerComponentsProps) {
  return await Rows_List.loader({ ...props, request });
}

export async function POST(request: NextRequest, props: IServerComponentsProps) {
  return await Rows_List.action({ ...props, request });
}
