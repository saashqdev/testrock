import { UserDto } from "@/db/models/accounts/UsersModel";
import { OnboardingFilterDto } from "./OnboardingFilterDto";

export interface OnboardingCandidateDto {
  id: string;
  user: UserDto;
  tenant: { id: string; name: string; slug: string } | null;
  matchingFilters: OnboardingFilterDto[];
}
