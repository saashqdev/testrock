export type OnboardingSessionStepsModel = {
  id: string;
  sessionId: string;
  stepName: string;
  startedAt: Date;
  completedAt: Date | null;
  status: "pending" | "in_progress" | "completed" | "failed";
  metadata: Record<string, any>;
};
