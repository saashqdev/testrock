"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import MonacoEditor from "@/components/editors/MonacoEditor";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import InputText, { RefInputText } from "@/components/ui/input/InputText";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { WorkflowDto } from "../../dtos/WorkflowDto";
import { WorkflowInputExampleDto } from "../../dtos/WorkflowInputExampleDto";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";

export default function WorkflowInputExamples({ workflow }: { workflow: WorkflowDto }) {
  const router = useRouter();
  const [addingInputExample, setAddingInputExample] = useState(false);
  const [selectedInputExample, setSelectedInputExample] = useState<WorkflowInputExampleDto | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitForm(formData: FormData) {
    setLoading(true);
    try {
      const response = await fetch(window.location.href, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.success);
        router.refresh(); // Refresh the page to show updated data
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(item: WorkflowInputExampleDto) {
    setSelectedInputExample(null);
    setAddingInputExample(false);
    const form = new FormData();
    form.set("action", "create-input-example");
    form.set("title", item.title);
    form.set("input", JSON.stringify(item.input));
    await submitForm(form);
  }

  async function onUpdate(item: WorkflowInputExampleDto) {
    if (!item.id) {
      return;
    }
    setSelectedInputExample(null);
    setAddingInputExample(false);
    const form = new FormData();
    form.set("action", "update-input-example");
    form.set("id", item.id || "");
    form.set("title", item.title);
    form.set("input", JSON.stringify(item.input));
    await submitForm(form);
  }

  async function onDelete(item: WorkflowInputExampleDto) {
    if (!item.id) {
      return;
    }
    setSelectedInputExample(null);
    setAddingInputExample(false);
    const form = new FormData();
    form.set("action", "delete-input-example");
    form.set("id", item.id || "");
    await submitForm(form);
  }
  return (
    <div>
      <div className="space-y-3">
        <div className="space-y-0.5 text-sm">
          <div className="font-medium text-foreground/80">Input examples</div>
          <div className="text-muted-foreground">Examples of input data</div>
        </div>
        <div className="space-y-2">
          {workflow.inputExamples.map((inputExample) => {
            return (
              <button
                type="button"
                key={inputExample.id}
                className="w-full rounded-md border border-dotted border-border bg-secondary p-2 hover:border-dashed hover:bg-secondary/90 disabled:opacity-50"
                disabled={loading}
                onClick={() => {
                  setAddingInputExample(false);
                  setSelectedInputExample(inputExample);
                }}
              >
                <div className="flex justify-between space-x-2">
                  <div className="font-sm shrink-0 text-xs text-foreground/80">{inputExample.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{JSON.stringify(inputExample.input, null, 2)}</div>
                </div>
              </button>
            );
          })}
          <button
            type="button"
            className="w-full rounded-md border border-dotted border-border bg-background p-2 hover:border-dashed hover:bg-secondary disabled:opacity-50"
            disabled={loading}
            onClick={() => {
              setAddingInputExample(true);
              setSelectedInputExample(null);
            }}
          >
            <div className="font-sm text-xs text-foreground/80">- Add input example -</div>
          </button>
        </div>
      </div>

      <SlideOverWideEmpty
        open={!!selectedInputExample}
        title={"Edit input example: " + selectedInputExample?.title}
        onClose={() => setSelectedInputExample(null)}
        className="sm:max-w-sm"
      >
        <WorkflowInputExampleForm item={selectedInputExample} onSave={onUpdate} onDelete={onDelete} onCancel={() => setSelectedInputExample(null)} />
      </SlideOverWideEmpty>

      <SlideOverWideEmpty open={addingInputExample} title={"Add input example"} onClose={() => setAddingInputExample(false)} className="sm:max-w-sm">
        <WorkflowInputExampleForm item={null} onSave={onCreate} onCancel={() => setAddingInputExample(false)} />
      </SlideOverWideEmpty>
    </div>
  );
}

function WorkflowInputExampleForm({
  item,
  onSave,
  onCancel,
  onDelete,
}: {
  item: WorkflowInputExampleDto | null;
  onSave: (item: WorkflowInputExampleDto) => Promise<void>;
  onCancel: () => void;
  onDelete?: (item: WorkflowInputExampleDto) => Promise<void>;
}) {
  const [title, setTitle] = useState(item?.title || "");
  const [input, setInput] = useState(
    item?.input
      ? JSON.stringify(item.input, null, 2)
      : JSON.stringify(
          {
            sample: "value",
          },
          null,
          2
        )
  );
  const [submitting, setSubmitting] = useState(false);

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    let inputJson: { [key: string]: any } = {};
    try {
      inputJson = JSON.parse(input);
    } catch (e) {
      toast.error("Invalid JSON");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        id: item?.id || undefined,
        title,
        input: inputJson,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete || !item || submitting) return;

    setSubmitting(true);
    try {
      await onDelete(item);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-1">
        <InputText ref={mainInput} title="Title" value={title} setValue={setTitle} required disabled={submitting} />
        <div className="overflow-hidden">
          <label className="mb-1 block text-sm font-medium text-foreground/80">Input</label>
          <MonacoEditor theme="vs-dark" className="h-80" value={input} onChange={setInput} language="json" tabSize={2} hideLineNumbers />
        </div>
      </div>
      <div className="mt-2 border-t border-border pt-2">
        <div className="flex justify-between space-x-2">
          <div>
            {onDelete && item && (
              <ButtonSecondary destructive disabled={submitting} onClick={handleDelete}>
                {submitting ? "Deleting..." : "Delete"}
              </ButtonSecondary>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <ButtonSecondary type="button" disabled={submitting} onClick={onCancel}>
              Cancel
            </ButtonSecondary>
            <ButtonPrimary type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </form>
  );
}
