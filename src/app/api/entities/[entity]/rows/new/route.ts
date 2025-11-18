import { NextRequest, NextResponse } from "next/server";
import { loader, action } from "@/modules/rows/routes/Rows_New.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function GET(request: NextRequest, context: { params: Promise<{ entity: string }> }) {
  try {
    const params = await context.params;
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    
    console.log('[API /api/entities/[entity]/rows/new GET] Entity:', params.entity);
    
    const props: IServerComponentsProps = {
      params: context.params,
      searchParams: Promise.resolve(searchParams),
      request,
    };
    
    const response = await loader(props);
    console.log('[API /api/entities/[entity]/rows/new GET] Response status:', response.status);
    return response;
  } catch (error) {
    console.error('[API /api/entities/[entity]/rows/new GET] Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ entity: string }> }) {
  try {
    const params = await context.params;
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    
    console.log('[API /api/entities/[entity]/rows/new POST] Entity:', params.entity);
    console.log('[API /api/entities/[entity]/rows/new POST] Request URL:', request.url);
    console.log('[API /api/entities/[entity]/rows/new POST] Request method:', request.method);
    
    const props: IServerComponentsProps = {
      params: context.params,
      searchParams: Promise.resolve(searchParams),
      request,
    };
    
    console.log('[API /api/entities/[entity]/rows/new POST] Calling action...');
    const response = await action(props);
    console.log('[API /api/entities/[entity]/rows/new POST] Action completed. Response status:', response.status);
    console.log('[API /api/entities/[entity]/rows/new POST] Response content-type:', response.headers.get('content-type'));
    return response;
  } catch (error) {
    console.error('[API /api/entities/[entity]/rows/new POST] Error:', error);
    console.error('[API /api/entities/[entity]/rows/new POST] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
