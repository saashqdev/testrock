"use server";

import { getServerTranslations } from "@/i18n/server";
import CrmService from "@/modules/crm/services/CrmService";
import IpAddressServiceServer from "@/modules/ipAddress/services/IpAddressService.server";
import UserUtils from "@/utils/app/UserUtils";
import { headers } from "next/headers";

type ActionResult = {
  error?: string;
  success?: string;
};

export async function submitContactForm(formData: FormData): Promise<ActionResult> {
  const { t } = await getServerTranslations();
  
  const submission = {
    firstName: formData.get("first_name")?.toString() ?? "",
    lastName: formData.get("last_name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    company: formData.get("company")?.toString() ?? "",
    jobTitle: formData.get("jobTitle")?.toString() ?? "",
    users: formData.get("users")?.toString() ?? "",
    message: formData.get("comments")?.toString() ?? "",
    honeypot: formData.get("codeId")?.toString() ?? "",
  };

  try {
    // Create a mock request object for IpAddressServiceServer
    const headersList = await headers();
    const mockRequest = new Request("http://localhost", {
      headers: headersList,
    });

    await IpAddressServiceServer.log(mockRequest, {
      action: "contact",
      description: `${submission.firstName} ${submission.lastName} <${submission.email}>`,
      metadata: submission,
      block: UserUtils.isSuspicious({
        email: submission.email,
        firstName: submission.firstName,
        lastName: submission.lastName,
        honeypot: submission.honeypot,
      }),
    });

    const existingContact = await CrmService.createContactSubmission(submission, mockRequest);
    
    if (existingContact) {
      return {
        success: t("front.contact.success", { 0: submission.firstName }),
      };
    } else {
      return {
        error: t("front.contact.error"),
      };
    }
  } catch (e: any) {
    return { 
      error: e.message 
    };
  }
}
