"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PromptExecutions from "@/modules/promptBuilder/components/PromptExecutions";
import { PromptFlowWithExecutionsDto } from "@/db/models/promptFlows/PromptFlowsModel";

interface PromptExecutionsClientProps {
  item: PromptFlowWithExecutionsDto;
}

export default function PromptExecutionsClient({ item }: PromptExecutionsClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDelete(id: string) {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/prompts/executions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Delete failed:", error);
        // You might want to show a toast notification here
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      // You might want to show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  }

  return <PromptExecutions item={item} onDelete={onDelete} />;
}
