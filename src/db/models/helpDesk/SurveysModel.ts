import { Survey, SurveyItem } from "@prisma/client";

export type SurveysModel = {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
};

export type SurveyWithDetailsDto = Survey & {
  items: SurveyItem[];
  _count: {
    submissions: number;
  };
};
