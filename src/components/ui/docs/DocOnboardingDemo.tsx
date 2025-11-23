"use client";

import { useEffect, useState } from "react";
import { nextrockOnboardingStepBlocks } from "@/modules/onboarding/blocks/defaultOnboarding/nextrockOnboarding";
import OnboardingBlock from "@/modules/onboarding/blocks/OnboardingBlock";
import { OnboardingBlockDto } from "@/modules/onboarding/blocks/OnboardingBlockUtils";
import ButtonPrimary from "../buttons/ButtonPrimary";

export default function DocOnboardingDemo() {
  const [open, setOpen] = useState(false);
  const [onboardingBlock, setOnboardingBlock] = useState<OnboardingBlockDto>();

  useEffect(() => {
    setOnboardingBlock({
      style: "modal",
      title: "Onboarding Demo",
      canBeDismissed: true,
      steps: nextrockOnboardingStepBlocks,
      height: "lg",
    });
  }, []);
  return (
    <div>
      <ButtonPrimary onClick={() => setOpen(true)}>Open Onboarding Demo</ButtonPrimary>
      {onboardingBlock && <OnboardingBlock open={open} onClose={() => setOpen(false)} item={onboardingBlock} />}
      {/* <OnboardingBlockForm item={onboardingBlock} onUpdate={onUpdateOnboardingBlock} /> */}
    </div>
  );
}
