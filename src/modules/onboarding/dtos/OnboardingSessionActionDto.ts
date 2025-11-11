export interface OnboardingSessionActionDto {
  id?: string;
  type: "click" | "input";
  name: string;
  value: string;
  createdAt?: Date;
}
