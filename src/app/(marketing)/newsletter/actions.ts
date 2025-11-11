'use server';

import { getServerTranslations } from "@/i18n/server";
import CrmService from "@/modules/crm/services/CrmService";
import { validateCSRFToken } from "@/lib/services/session.server";
import IpAddressServiceServer from "@/modules/ipAddress/services/IpAddressService.server";
import UserUtils from "@/utils/app/UserUtils";
import { headers } from "next/headers";

type ActionData = {
  error?: string;
  success?: string;
};

export async function subscribeAction(prevState: ActionData | null, formData: FormData): Promise<ActionData> {
  const { t } = await getServerTranslations();
  
  try {
    const firstName = formData.get("first_name")?.toString() ?? "";
    const lastName = formData.get("last_name")?.toString() ?? "";
    const email = formData.get("email")?.toString() ?? "";
    const source = formData.get("source")?.toString() ?? "";
    const honeypot = formData.get("codeId")?.toString() ?? "";
    const csrf = formData.get("csrf")?.toString() ?? "";

    if (!email) {
      return { error: "Missing fields" };
    }

    // Create a mock request object for compatibility with existing services
    // In Next.js App Router, you'll need to adapt these services to work without the full request object
    const headersList = await headers();
    const mockRequest = {
      headers: new Headers(headersList as HeadersInit),
      url: headersList.get('referer') || '',
    } as Request;

    try {
      await validateCSRFToken(mockRequest);
    } catch (e: any) {
      return { error: e.message };
    }

    await IpAddressServiceServer.log(mockRequest, {
      action: "newsletter",
      description: `${firstName} ${lastName} <${email}>`,
      metadata: { source },
      block: UserUtils.isSuspicious({ email, firstName, lastName, honeypot }),
    });

    const subscribed = await CrmService.subscribeToNewsletter({
      firstName,
      lastName,
      email,
      source,
      request: mockRequest,
    });
    
    if (subscribed.success) {
      return { success: t("front.newsletter.checkEmail") };
    } else {
      return { error: subscribed.error };
    }
  } catch (e: any) {
    return { error: e.message };
  }
}
