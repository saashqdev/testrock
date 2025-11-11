"use client";

import { PromptFlowGroup } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import PromptFlowForm from "@/modules/promptBuilder/components/PromptFlowForm";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

type LoaderData = {
  allEntities: EntityWithDetailsDto[];
  promptFlowGroups: PromptFlowGroup[];
};

type ActionData = {
  error?: string;
  success?: string;
};

export default function NewPromptFlowPage() {
  const [data, setData] = useState<LoaderData | null>(null);
  const [actionData, setActionData] = useState<ActionData | undefined>();
  const router = useRouter();

  useEffect(() => {
    // Fetch loader data on component mount
    fetch("/api/admin/prompts/builder/new")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((error) => console.error("Error loading data:", error));
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <SlideOverWideEmpty
        title={"Prompt Flow"}
        description="Create a new prompt flow."
        open={true}
        onClose={() => {
          router.push("/admin/prompts/builder");
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <PromptFlowForm promptFlowGroups={data.promptFlowGroups} item={undefined} allEntities={data.allEntities} />
      </SlideOverWideEmpty>

      <ActionResultModal actionData={actionData ?? undefined} showSuccess={false} />
    </div>
  );
}
