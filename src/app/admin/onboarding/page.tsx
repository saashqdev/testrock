import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { OnboardingSummaryApi } from "@/modules/onboarding/routes/api/OnboardingSummaryApi.server";
import OnboardingOverviewRoute from "@/modules/onboarding/routes/components/OnboardingSummaryRoute";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await OnboardingSummaryApi.loader(props);
  
  // Convert MetaTagsDto array to Metadata object
  const metadata: Metadata = { title: "Onboarding" };
  if (data?.meta) {
    for (const tag of data.meta) {
      if ('title' in tag) {
        metadata.title = tag.title;
      }
      // Add more conversions as needed
    }
  }
  return metadata;
}

export default async function OnboardingPage(props: IServerComponentsProps) {
  const data = await OnboardingSummaryApi.loader(props);
  return <OnboardingOverviewRoute data={data} />;
}
