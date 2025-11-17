import { loader, action } from "@/modules/rows/routes/Rows_Edit.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, props: IServerComponentsProps) {
  return await loader({ ...props, request });
}

export async function POST(request: NextRequest, props: IServerComponentsProps) {
  const formData = await request.formData();
  return await action(formData, { ...props, request });
}
