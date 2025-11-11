import { OnboardingSessionOverviewApi } from "../../api/sessions/OnboardingSessionOverviewApi.server";

interface OnboardingSessionOverviewRouteProps {
  data: OnboardingSessionOverviewApi.LoaderData;
}

export default function OnboardingSessionOverviewRoute({ data }: OnboardingSessionOverviewRouteProps) {
  return (
    <div>
      <div>Email: {data.item.user.email}</div>
    </div>
  );
}
