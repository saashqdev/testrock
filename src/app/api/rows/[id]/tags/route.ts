import { NextRequest, NextResponse } from 'next/server';
import { Rows_Tags } from '@/modules/rows/routes/Rows_Tags.server';
import { IServerComponentsProps } from '@/lib/dtos/ServerComponentsProps';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Create props object that matches IServerComponentsProps
    const resolvedParams = await Promise.resolve(params);
    const props: IServerComponentsProps = {
      params: Promise.resolve(resolvedParams),
      request,
    };
    
    const data = await Rows_Tags.loader(props);
    return data;
  } catch (error) {
    console.error('Error fetching row tags data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch row tags data' },
      { status: 500 }
    );
  }
}