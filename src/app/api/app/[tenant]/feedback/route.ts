import { NextRequest, NextResponse } from "next/server";
import { getServerTranslations } from "@/i18n/server";
import { getUserInfo } from "@/lib/services/session.server";
import FeedbackServer from "@/modules/helpDesk/services/Feedback.server";

export async function POST(request: NextRequest) {
  const { t } = await getServerTranslations();
  const userInfo = await getUserInfo();
  
  try {
    const formData = await request.formData();
    const action = formData.get("action")?.toString();
    
    if (action === "add-feedback") {
      if (!userInfo.userId) {
        return NextResponse.json({ error: t("feedback.notLoggedIn") }, { status: 400 });
      }
      
      const message = formData.get("message")?.toString() || "";
      const fromUrl = formData.get("fromUrl")?.toString() || "";
      const tenantId = formData.get("tenantId")?.toString() || null;
      
      if (!message) {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
      }
      
      try {
        await FeedbackServer.send({
          t,
          tenantId,
          userId: userInfo.userId,
          message,
          fromUrl,
        });
        return NextResponse.json({ success: t("feedback.sent") });
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
