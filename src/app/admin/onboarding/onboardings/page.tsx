import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { loader } from "@/modules/onboarding/routes/api/onboardings/OnboardingsIndexApi.server";
import OnboardingIndexRoute from "@/modules/onboarding/routes/components/onboardings/OnboardingsIndexRoute";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  const title = data?.meta?.find((tag) => "title" in tag)?.title;
  return {
    title: title || "",
  };
}

export default async function Page(props: IServerComponentsProps) {
  const data = await loader(props);
  return <OnboardingIndexRoute data={data} />;
}
