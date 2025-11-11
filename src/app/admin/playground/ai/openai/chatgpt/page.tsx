"use client";

import clsx from "clsx";
import { useEffect, useRef, useState, useTransition } from "react";
import InputText from "@/components/ui/input/InputText";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import InputSelect from "@/components/ui/input/InputSelect";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

type ActionData = {
  error?: string;
  images?: string[];
};

export default function Index() {
  const [isPending, startTransition] = useTransition();

  const formRef = useRef<HTMLFormElement>(null);
  const refContent = useRef<HTMLTextAreaElement>(null);

  const [type, setType] = useState("ChatGPT");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [actionData, setActionData] = useState<ActionData | null>(null);

  useEffect(() => {
    const isPrompting = isLoading || isPending;
    if (!isPrompting) {
      // formRef.current?.reset();
      formRef.current?.focus();
      setPrompt("");
    }
  }, [isLoading, isPending]);

  const onGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const form = new FormData(e.currentTarget);

    if (form.get("type") === "DALL-E") {
      startTransition(async () => {
        try {
          const response = await fetch("/api/ai/openai/dalle", {
            method: "POST",
            body: form,
          });

          if (!response.ok) {
            const errorData = await response.json();
            setActionData({ error: errorData.error || "Failed to generate images" });
            return;
          }

          const data = await response.json();
          setActionData(data);
        } catch (error: any) {
          setActionData({ error: error.message });
        }
      });
    } else if (form.get("type") === "ChatGPT") {
      setContent("");
      setIsLoading(true);
      const response = await fetch("/api/ai/openai/chatgpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      if (!response.ok) {
        const jsonBody = await response.text();
        setError(response.statusText + ": " + jsonBody);
        setIsLoading(false);
        return;
      }

      // This data is a ReadableStream
      const data = response.body;
      if (!data) {
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        if (refContent.current) {
          refContent.current.scrollTop = refContent.current.scrollHeight;
        }
        setContent((prev) => prev + chunkValue);
      }
      setIsLoading(false);
    }
  };

  function isBusy() {
    return isLoading || isPending;
  }
  return (
    <div>
      <div className="container mx-auto h-[calc(100vh-100px)] max-w-5xl space-y-3 overflow-hidden px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold">OpenAI - ChatGPT + DALL-E</h1>
          {/* Add input for prompt with a Generate button */}
          <form ref={formRef} onSubmit={onGenerate}>
            <div className="flex space-x-2">
              <InputSelect
                className="w-40"
                title="Type"
                name="type"
                disabled={isBusy()}
                required
                options={[
                  {
                    name: "ChatGPT",
                    value: "ChatGPT",
                  },
                  {
                    name: "DALL-E",
                    value: "DALL-E",
                  },
                ]}
                value={type}
                onChange={(e) => setType(e?.toString() ?? "")}
              />
              <InputText
                autoFocus
                className="w-full"
                title="Prompt"
                type="text"
                name="prompt"
                placeholder={type === "ChatGPT" ? "I don't remember previous messages..." : "Type something and I'll generate an image..."}
                disabled={isBusy()}
                minLength={1}
                required
                value={prompt}
                setValue={setPrompt}
              />
            </div>
          </form>
        </div>

        {error ? (
          <ErrorBanner title="Error" text={error} />
        ) : type === "ChatGPT" ? (
          <div>
            <Textarea
              ref={refContent}
              className={clsx("border-border h-full w-full rounded-md border px-4 py-2", { "cursor-not-allowed opacity-50": isBusy() })}
              disabled={isBusy()}
              rows={18}
              defaultValue={content}
            />
          </div>
        ) : type === "DALL-E" ? (
          <div className="overflow-y-scroll">
            <div className="mx-auto">
              <div role="status" className="space-y-8 md:flex md:items-center md:space-y-0 md:space-x-8">
                <Image
                  alt="Generated with DAll-E"
                  src={
                    !actionData?.images || actionData?.images?.length === 0 ? "https://placehold.co/512x512?text=Prompt%20something..." : actionData?.images[0]
                  }
                  className="bg-secondary flex h-[calc(100vh-250px)] w-full items-center justify-center rounded object-contain"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
