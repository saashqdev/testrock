import ServerError from "@/components/ui/errors/ServerError";
import { OnboardingSessionOverviewApi } from "@/modules/onboarding/routes/api/sessions/OnboardingSessionOverviewApi.server";
import OnboardingSessionOverviewRoute from "@/modules/onboarding/routes/components/sessions/OnboardingSessionOverviewRoute";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function SessionDetailPage(props: IServerComponentsProps) {
  const data = await OnboardingSessionOverviewApi.loader(props);
  return <OnboardingSessionOverviewRoute data={data} />;
}
