import { NextRequest, NextResponse } from "next/server";
import { WorkflowsIdRunApiApi } from "@/modules/workflowEngine/routes/workflow-engine/__workflow/workflows.$id.run.api.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    
    const props: IServerComponentsProps = {
      params: Promise.resolve({ id }),
      searchParams: Promise.resolve(searchParams),
    };
    
    const data = await WorkflowsIdRunApiApi.loader(props);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/workflows/[id]/run/api:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    
    const props: IServerComponentsProps = {
      params: Promise.resolve({ id }),
      searchParams: Promise.resolve(searchParams),
      request: {
        ...request,
        body,
      } as any,
    };
    
    const result = await WorkflowsIdRunApiApi.action(props);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in POST /api/workflows/[id]/run/api:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
