import { EventWebhookAttempt } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/config/prisma/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let attempt: EventWebhookAttempt | null = null;
  try {
    const { id } = await params;
    
    attempt = await prisma.eventWebhookAttempt.findUnique({ 
      where: { id: id ?? "" } 
    });
    
    if (!attempt) {
      return NextResponse.json(
        { error: "Invalid event webhook attempt" },
        { status: 404 }
      );
    }
    
    await prisma.eventWebhookAttempt.update({
      where: {
        id: attempt.id,
      },
      data: {
        startedAt: new Date(),
      },
    });
    
    // eslint-disable-next-line no-console
    console.log("event-webhook-endpoint", attempt.endpoint);
    
    const body = await request.json();
    const response = await fetch(attempt.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (response.ok) {
      await prisma.eventWebhookAttempt.update({
        where: {
          id: attempt.id,
        },
        data: {
          finishedAt: new Date(),
          success: true,
          status: response.status,
          message: response.statusText,
          body: JSON.stringify(await response.json()),
        },
      });
    } else {
      await prisma.eventWebhookAttempt.update({
        where: {
          id: attempt.id,
        },
        data: {
          finishedAt: new Date(),
          success: false,
          status: response.status,
          message: await response.text(),
        },
      });
    }

    return NextResponse.json({}, { status: 200 });
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.log("event-webhook-attempt-error", e.message);
    
    if (attempt) {
      await prisma.eventWebhookAttempt.update({
        where: {
          id: attempt.id,
        },
        data: {
          finishedAt: new Date(),
          success: false,
          status: 400,
          message: e.message,
        },
      });
    }
    
    return NextResponse.json(
      { error: e.message },
      { status: 400 }
    );
  }
}
