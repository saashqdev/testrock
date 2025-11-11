import { SurveySubmissionWithDetailsDto } from "@/db/models/helpDesk/SurveySubmissionsModel";

export interface ISurveySubmissionsDb {
  getSurveySubmissions(surveyId: string): Promise<SurveySubmissionWithDetailsDto[]>;
  deleteSurveySubmission(id: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    surveyId: string;
    userAnalyticsId: string;
    ipAddress: string;
  }>;
}
