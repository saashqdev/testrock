import CrmService from "@/modules/crm/services/CrmService";
import { db } from "@/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const RecordType: "Delivery" | "Bounce" | "SpamComplaint" | "Open" | "Click" | "SubscriptionChange" = body.RecordType;
    const Metadata = body.Metadata;
    if (Metadata.example === "value") {
      return Response.json({}, { status: 200 });
    }
    const outboundEmailId = Metadata.outboundEmailId;
    if (!outboundEmailId) {
      return Response.json({ error: "Metadata required: outboundEmailId", body }, { status: 404 });
    }
    const outboundEmail = await db.outboundEmails.getOutboundEmail(outboundEmailId);
    // eslint-disable-next-line no-console
    console.log({ RecordType, outboundEmail });
    if (!outboundEmail) {
      return Response.json({ error: "No outbound email found with ID: " + outboundEmailId, body }, { status: 404 });
    }

    if (RecordType === "Delivery") {
      await db.outboundEmails.updateOutboundEmail(outboundEmail.id, {
        deliveredAt: new Date(body.DeliveredAt),
      });
    } else if (RecordType === "Bounce") {
      await db.outboundEmails.updateOutboundEmail(outboundEmail.id, {
        bouncedAt: new Date(body.DeliveredAt),
      });
    } else if (RecordType === "SpamComplaint") {
      await db.outboundEmails.updateOutboundEmail(outboundEmail.id, {
        spamComplainedAt: new Date(body.DeliveredAt),
      });
    } else if (RecordType === "Open") {
      await db.outboundEmails.openedOutboundEmail(outboundEmail.id, {
        firstOpen: Boolean(body.FirstOpen),
      });
    } else if (RecordType === "Click") {
      await db.outboundEmails.clickedOutboundEmail(outboundEmail.id, {
        link: body.OriginalLink,
      });
    } else if (RecordType === "SubscriptionChange") {
      if (body.SuppressSending) {
        // eslint-disable-next-line no-console
        console.log("Unsubscribed from email: " + outboundEmail.email);
        await db.outboundEmails.updateOutboundEmail(outboundEmail.id, {
          unsubscribedAt: new Date(),
        });
        if (outboundEmail.contactRowId) {
          const contact = await CrmService.getContact(outboundEmail.contactRowId);
          if (contact) {
            await CrmService.updateContact(contact.id, {
              marketingSubscriber: false,
            });
          }
        }
      }
    }
    return Response.json({}, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
