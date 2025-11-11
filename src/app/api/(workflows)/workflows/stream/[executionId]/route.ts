import { emitter } from "@/utils/stream/emitter.server";
import { eventStream } from "@/utils/stream/event-stream";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ executionId: string }> }
) {
  const resolvedParams = await params;
  const eventName = `workflowExecutionUpdate:${resolvedParams.executionId}`;
  
  return eventStream(request.signal, (send) => {
    // listener handler
    const listener = (data: string) => {
      // data should be serialized
      send({ data });
    };

    // event listener itself
    emitter.on(eventName, listener);

    // cleanup
    return () => {
      emitter.off(eventName, listener);
    };
  });
}
