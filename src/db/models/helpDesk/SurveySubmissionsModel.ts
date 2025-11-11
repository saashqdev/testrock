import { SurveySubmission, SurveySubmissionResult } from "@prisma/client";

export type SurveySubmissionsModel = {
  id: string;
  surveyId: string;
  userId: string;
  responses: Record<string, any>;
  submittedAt: Date;
};

export type SurveySubmissionWithDetailsDto = SurveySubmission & {
  results: SurveySubmissionResult[];
};
