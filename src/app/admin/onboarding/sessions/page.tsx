import ServerError from "@/components/ui/errors/ServerError";
import { OnboardingSessionsIndexApi } from "@/modules/onboarding/routes/api/sessions/OnboardingSessionsIndexApi.server";
import OnboardingSessionsIndexRoute from "@/modules/onboarding/routes/components/sessions/OnboardingSessionsIndexRoute";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function SessionsPage(props: IServerComponentsProps) {
  const data = await OnboardingSessionsIndexApi.loader(props);
  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <OnboardingSessionsIndexRoute data={data} />
    </div>
  );
}
