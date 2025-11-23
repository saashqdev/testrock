import { NextRequest, NextResponse } from "next/server";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { LoaderData, action } from "@/modules/emailMarketing/routes/Senders_List";
import { db } from "@/db";

export async function GET(request: NextRequest) {
  try {
    // Note: You may need to adapt the requireAuth function for Next.js API routes
    // await requireAuth();

    const { searchParams } = new URL(request.url);
    const tenantId = await getTenantIdOrNull({
      request,
      params: Object.fromEntries(searchParams.entries()),
    });

    const items = await db.emailSenders.getAllEmailSenders(tenantId);
    const deliveredEmails = await db.outboundEmails.findOutboundEmails(tenantId, {
      where: {
        deliveredAt: { not: null },
      },
    });

    const data: LoaderData = {
      items,
      hasSetWebhooks: deliveredEmails.length > 0,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching email senders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Note: You may need to adapt the requireAuth function for Next.js API routes
    // await requireAuth();

    const { searchParams } = new URL(request.url);
    const tenantId = await getTenantIdOrNull({
      request,
      params: Object.fromEntries(searchParams.entries()),
    });

    const formData = await request.formData();

    // Use the existing action logic from Senders_List
    const mockRequest = {
      formData: () => Promise.resolve(formData),
      url: request.url,
      headers: request.headers,
    } as any;

    const result = await action({
      request: mockRequest,
      params: Promise.resolve(Object.fromEntries(searchParams.entries())),
    });

    if (result instanceof Response) {
      const resultData = await result.json();
      return NextResponse.json(resultData, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error handling sender action:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
