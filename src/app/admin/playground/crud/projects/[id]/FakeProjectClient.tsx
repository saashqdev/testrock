"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import FakeProjectOverview from "@/modules/fake/fakeProjectsCrud/components/FakeProjectOverview";
import { FakeProjectDto } from "@/modules/fake/fakeProjectsCrud/dtos/FakeProjectDto";
import FakeProjectForm from "@/modules/fake/fakeProjectsCrud/components/FakeProjectForm";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import { updateProject, deleteProject, completeTask } from "../actions";

type ActionData = {
  success?: string;
  error?: string;
};

interface FakeProjectClientProps {
  item: FakeProjectDto;
}

export default function FakeProjectClient({ item }: FakeProjectClientProps) {
  const [actionData, setActionData] = useState<ActionData | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleCompleteTask = async (taskId: string) => {
    startTransition(async () => {
      const result = await completeTask(item.id, taskId);
      if (result.error) {
        setActionData({ error: result.error });
      } else {
        setActionData({ success: result.success });
        router.refresh();
      }
    });
  };

  return (
    <EditPageLayout
      title="Edit Fake Project"
      menu={[
        {
          title: "Fake Projects",
          routePath: "/admin/playground/crud/projects",
        },
        {
          title: item?.name ?? "Edit",
          routePath: "/admin/playground/crud/projects/" + item?.id,
        },
      ]}
    >
      <div className="flex items-center justify-between space-x-2">
        <h1 className="text-foreground truncate text-lg font-bold">{item?.name}</h1>
        <ButtonSecondary
          onClick={() => {
            if (searchParams.get("editing")) {
              router.push(window.location.pathname);
            } else {
              const params = new URLSearchParams(searchParams.toString());
              params.set("editing", "true");
              router.push(`${window.location.pathname}?${params.toString()}`);
            }
          }}
        >
          {searchParams.get("editing") ? "Cancel" : "Edit"}
        </ButtonSecondary>
      </div>

      {item && (
        <>
          <div className="mx-auto space-y-2">
            {searchParams.get("editing") ? (
              <FakeProjectForm
                item={item}
                action={async (formData: FormData) => {
                  const name = formData.get("name")?.toString() ?? "";
                  const description = formData.get("description")?.toString();
                  const tasks = formData.getAll("tasks[]").map((f) => JSON.parse(f.toString()));
                  const isActive = formData.get("isActive");
                  const active = isActive ? isActive.toString() === "on" || isActive.toString() === "true" : false;
                  
                  return await updateProject(item.id, { name, description, active, tasks });
                }}
                canDelete={true}
                onCancel={() => {
                  router.push(window.location.pathname);
                }}
              />
            ) : (
              <FakeProjectOverview
                item={item}
                actionData={actionData}
                onCompleteTask={(s) => handleCompleteTask(s.id)}
              />
            )}
          </div>
        </>
      )}
    </EditPageLayout>
  );
}
