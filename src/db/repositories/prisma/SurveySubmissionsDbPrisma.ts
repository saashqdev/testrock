import { ISurveySubmissionsDb } from "@/db/interfaces/helpDesk/ISurveySubmissionsDb";
import { prisma } from "@/db/config/prisma/database";
import { SurveySubmissionWithDetailsDto } from "@/db/models/helpDesk/SurveySubmissionsModel";

export class SurveySubmissionsDbPrisma implements ISurveySubmissionsDb {
  async getSurveySubmissions(surveyId: string): Promise<SurveySubmissionWithDetailsDto[]> {
    return await prisma.surveySubmission.findMany({
      where: {
        surveyId,
      },
      include: {
        results: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async deleteSurveySubmission(id: string) {
    return await prisma.surveySubmission.delete({
      where: { id },
    });
  }
}
