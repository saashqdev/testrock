import { NextRequest, NextResponse } from "next/server";
import { cancelSubscriptionAction, addPaymentMethodAction, deletePaymentMethodAction, openCustomerPortalAction } from "../../settings.subscription.actions";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const action = formData.get("action")?.toString();

    if (!action) {
      return NextResponse.json({ error: "No action specified" }, { status: 400 });
    }

    let result;

    switch (action) {
      case "cancel":
        result = await cancelSubscriptionAction(formData);
        break;
      case "add-payment-method":
        result = await addPaymentMethodAction();
        break;
      case "delete-payment-method":
        result = await deletePaymentMethodAction(formData);
        break;
      case "open-customer-portal":
        result = await openCustomerPortalAction();
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // If there's a redirect URL, return it
    if (result.url) {
      return NextResponse.json({ url: result.url });
    }

    // If there's an error, return 400
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Success
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
