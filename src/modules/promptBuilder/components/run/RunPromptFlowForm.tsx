"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import InputText, { RefInputText } from "@/components/ui/input/InputText";
import { useEffect, useRef, useState } from "react";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import { useTranslation } from "react-i18next";
import { PromptExecutionResultDto } from "../../dtos/PromptExecutionResultDto";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import { marked } from "marked";
import { runPromptFlowAction, type RunPromptFlowState } from "./actions";
import { PromptTemplateResultWithTemplateDto } from "@/db/models/promptFlows/PromptFlowExecutionsModel";
import { useParams } from "next/navigation";

interface Props {
  item: PromptFlowWithDetailsDto;
  rowId?: string;
  initialVariables?: { [key: string]: string };
  autoRun?: boolean;
}
export default function RunPromptFlowForm({ item, rowId, initialVariables, autoRun = true }: Props) {
  const params = useParams();
  const { t } = useTranslation();
  const { pending } = useFormStatus();

  const [state, formAction] = useActionState(runPromptFlowAction, {
    promptFlowExecutionResult: null,
  } as RunPromptFlowState);

  const [variables, setVariables] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<PromptExecutionResultDto | null>(state?.promptFlowExecutionResult ?? null);

  const mainInput = useRef<RefInputText>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (initialVariables) {
      const variables = initialVariables;

      setTimeout(() => {
        mainInput.current?.input.current?.focus();

        const noVariablesOrAllVariablesSet = item.inputVariables.length === 0 || item.inputVariables.every((f) => !!variables[f.name]);
        // eslint-disable-next-line no-console
        console.log({
          variables: item.inputVariables.length,
          allSet: item.inputVariables.filter((f) => !!variables[f.name]),
        });
        if (noVariablesOrAllVariablesSet && autoRun) {
          // Trigger form submission
          formRef.current?.requestSubmit();
        }
      }, 100);

      setVariables(variables);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVariables]);

  useEffect(() => {
    if (state?.promptFlowExecutionResult) {
      setResult(state.promptFlowExecutionResult);
    }
  }, [state?.promptFlowExecutionResult]);

  return (
    <div key={item.id} className="z-40 space-y-2">
      {/* <h2 className="font-medium text-gray-800">{item.description}</h2> */}
      {state?.error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-700">{state.error}</div>}
      {!result ? (
        <form ref={formRef} action={formAction}>
          <input type="hidden" name="promptFlowId" value={item.id} />
          <input type="hidden" name="tenantSlug" value={params.tenant as string} />
          {rowId && <input type="hidden" name="rowId" value={rowId} />}
          {item.inputVariables.map((f) => {
            return (
              <input
                key={f.name}
                type="hidden"
                name={"variables[]"}
                value={JSON.stringify({
                  name: f.name,
                  value: variables[f.name],
                })}
              />
            );
          })}
          <div className="space-y-2">
            {item.inputVariables.length === 0 && <InfoBanner title={item.title}>{item.description}</InfoBanner>}
            {item.inputVariables.map((f, idx) => {
              return (
                <InputText
                  key={f.name}
                  ref={idx === 0 ? mainInput : undefined}
                  autoFocus={idx === 0}
                  name={f.name}
                  title={f.title}
                  required={f.isRequired}
                  value={variables[f.name]}
                  setValue={(e) => setVariables({ ...variables, [f.name]: e.toString() ?? "" })}
                  readOnly={pending}
                />
              );
            })}
            <div className="flex justify-end">
              <LoadingButton type="submit">Run</LoadingButton>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          {result.executionResult.results.map((f: PromptTemplateResultWithTemplateDto) => {
            return (
              <div key={f.id} className="flex flex-col rounded-md border border-border bg-white p-2 shadow-sm">
                <div className="text-sm font-medium text-gray-800">{f.template?.title}</div>
                <div className="prose">
                  <div dangerouslySetInnerHTML={{ __html: marked(f.response ?? "") }} />
                </div>
              </div>
            );
          })}
          <div className="flex justify-between space-x-2">
            <div></div>
            <div className="flex justify-between space-x-2">
              <ButtonSecondary
                onClick={() => {
                  setResult(null);
                }}
              >
                Run Again
              </ButtonSecondary>
              {result.outputResult.createdRows.length === 1 && (
                <ButtonPrimary target="_blank" to={result.outputResult.createdRows[0].href}>
                  View {t(result.outputResult.createdRows[0].entity.title)}
                </ButtonPrimary>
              )}
              {result.outputResult.updatedRows.length > 1 && (
                <ButtonPrimary target="_blank" to={result.outputResult.updatedRows[0].href}>
                  View {t(result.outputResult.updatedRows[0].entity.title)}
                </ButtonPrimary>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
