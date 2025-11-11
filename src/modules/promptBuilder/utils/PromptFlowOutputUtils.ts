import { PromptFlowOutputWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputsModel";
import { PromptFlowOutputTypes } from "../dtos/PromptFlowOutputType";

function getOutputTitle(item: PromptFlowOutputWithDetailsDto) {
  const type = PromptFlowOutputTypes.find((f) => f.value === item.type);
  return type ? type.name : item.type;
}

export default {
  getOutputTitle,
};
