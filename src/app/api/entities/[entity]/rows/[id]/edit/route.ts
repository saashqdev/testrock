import { NextRequest, NextResponse } from "next/server";
import { loader, action } from "@/modules/rows/routes/Rows_Edit.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function GET(request: NextRequest, context: { params: Promise<{ entity: string; id: string }> }) {
  try {
    const params = await context.params;
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    
    console.log('[API /api/entities/[entity]/rows/[id]/edit GET] Entity:', params.entity, 'ID:', params.id);
    
    const props: IServerComponentsProps = {
      params: context.params,
      searchParams: Promise.resolve(searchParams),
      request,
    };
    
    const response = await loader(props);
    console.log('[API /api/entities/[entity]/rows/[id]/edit GET] Response status:', response.status);
    return response;
  } catch (error) {
    console.error('[API /api/entities/[entity]/rows/[id]/edit GET] Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ entity: string; id: string }> }) {
  try {
    const params = await context.params;
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    
    console.log('[API /api/entities/[entity]/rows/[id]/edit POST] Entity:', params.entity, 'ID:', params.id);
    
    const props: IServerComponentsProps = {
      params: context.params,
      searchParams: Promise.resolve(searchParams),
      request,
    };
    
    const response = await action(props);
    console.log('[API /api/entities/[entity]/rows/[id]/edit POST] Response status:', response.status);
    return response;
  } catch (error) {
    console.error('[API /api/entities/[entity]/rows/[id]/edit POST] Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
