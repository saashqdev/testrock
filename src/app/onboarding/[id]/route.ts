import { getServerTranslations } from "@/i18n/server";
import { OnboardingSessionActionDto } from "@/modules/onboarding/dtos/OnboardingSessionActionDto";
import OnboardingSessionService from "@/modules/onboarding/services/OnboardingSessionService";
import { NextRequest } from "next/server";
import { db } from "@/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.onboardingSessions.getOnboardingSession(id);
  return Response.json({ item });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const { t } = await getServerTranslations();
  const formData = await request.formData();
  const actionName = formData.get("action");
  const session = await db.onboardingSessions.getOnboardingSession(sessionId);

  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }

  const actions = formData.getAll("actions[]").map((action: FormDataEntryValue) => {
    return JSON.parse(action.toString()) as OnboardingSessionActionDto;
  });

  switch (actionName) {
    case "started": {
      await OnboardingSessionService.started({ session, request });
      break;
    }
    case "dismissed": {
      await OnboardingSessionService.dismissed({ session, request });
      break;
    }
    case "add-actions": {
      await OnboardingSessionService.addActions(session, { actions });
      break;
    }
    case "set-step": {
      await OnboardingSessionService.setStep(session, {
        fromIdx: Number(formData.get("fromIdx")),
        toIdx: Number(formData.get("toIdx")),
        actions,
      });
      break;
    }
    case "complete": {
      await OnboardingSessionService.complete({
        session,
        data: { fromIdx: Number(formData.get("fromIdx")), actions },
        request,
      });
      break;
    }
    default: {
      return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  }

  return Response.json({});
}
