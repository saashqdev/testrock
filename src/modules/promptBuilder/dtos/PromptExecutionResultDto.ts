import { PromptFlowExecutionWithResultsDto } from "@/db/models/promptFlows/PromptFlowExecutionsModel";
import { PromptFlowOutputResultDto } from "./PromptFlowOutputResultDto";

export type PromptExecutionResultDto = {
  executionResult: PromptFlowExecutionWithResultsDto;
  outputResult: PromptFlowOutputResultDto;
};
