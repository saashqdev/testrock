"use client";

import { useActionState, startTransition } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import WorkflowBuilder from "@/modules/workflowEngine/components/workflows/WorkflowBuilder";
import WorkflowEditorSidebar from "@/modules/workflowEngine/components/workflows/WorkflowEditorSidebar";
import { WorkflowDto } from "@/modules/workflowEngine/dtos/WorkflowDto";
import { WorkflowBlockDto } from "@/modules/workflowEngine/dtos/WorkflowBlockDto";
import { WorkflowBlockType } from "@/modules/workflowEngine/dtos/WorkflowBlockTypes";
import { WorkflowConditionsGroupDto } from "@/modules/workflowEngine/dtos/WorkflowConditionDtos";
import {
  saveWorkflowAction,
  updateBlockAction,
  addBlockAction,
  connectBlocksAction,
  deleteBlockAction,
  deleteConnectionAction,
  updateConditionsGroupsAction,
  toggleWorkflowAction,
} from "./workflowActions";

interface WorkflowEditorClientProps {
  workflow: WorkflowDto;
}

export default function WorkflowEditorClient({ workflow: initialWorkflow }: WorkflowEditorClientProps) {
  const [workflow, setWorkflow] = useState<WorkflowDto>(initialWorkflow);
  const [selectedBlock, setSelectedBlock] = useState<WorkflowBlockDto | null>(null);
  const [addingNextBlockFrom, setAddingNextBlockFrom] = useState<{ fromBlock: WorkflowBlockDto; condition: string | null } | null>(null);

  // Action states
  const [saveState, saveFormAction] = useActionState(saveWorkflowAction, null);
  const [updateBlockState, updateBlockFormAction] = useActionState(updateBlockAction, null);
  const [addBlockState, addBlockFormAction] = useActionState(addBlockAction, null);
  const [connectBlocksState, connectBlocksFormAction] = useActionState(connectBlocksAction, null);
  const [deleteBlockState, deleteBlockFormAction] = useActionState(deleteBlockAction, null);
  const [deleteConnectionState, deleteConnectionFormAction] = useActionState(deleteConnectionAction, null);
  const [updateConditionsState, updateConditionsFormAction] = useActionState(updateConditionsGroupsAction, null);
  const [toggleState, toggleFormAction] = useActionState(toggleWorkflowAction, null);

  // Handle action results
  useEffect(() => {
    const actionStates = [
      saveState,
      updateBlockState,
      addBlockState,
      connectBlocksState,
      deleteBlockState,
      deleteConnectionState,
      updateConditionsState,
      toggleState,
    ];

    for (const state of actionStates) {
      if (state?.success) {
        toast.success(state.success);
      } else if (state?.error) {
        toast.error(state.error);
      }
    }
  }, [saveState, updateBlockState, addBlockState, connectBlocksState, deleteBlockState, deleteConnectionState, updateConditionsState, toggleState]);

  useEffect(() => {
    setWorkflow(initialWorkflow);
    if (selectedBlock) {
      const updatedBlock = initialWorkflow.blocks.find((x) => x.id === selectedBlock.id);
      setSelectedBlock(updatedBlock ?? null);
    }
  }, [initialWorkflow]);

  useEffect(() => {
    if (selectedBlock === null && addingNextBlockFrom !== null) {
      setAddingNextBlockFrom(null);
    }
  }, [addingNextBlockFrom, selectedBlock]);

  function onSave(workflow: WorkflowDto) {
    const formData = new FormData();
    formData.append("workflowId", workflow.id);
    formData.append("workflow", JSON.stringify(workflow));
    startTransition(() => {
      saveFormAction(formData);
    });
  }

  function onSaveBlock(block: WorkflowBlockDto) {
    const formData = new FormData();
    formData.append("workflowId", workflow.id);
    formData.append("blockId", block.id);
    formData.append("block", JSON.stringify(block));
    startTransition(() => {
      updateBlockFormAction(formData);
    });
  }

  function onAddBlock({ type, from, condition }: { type: WorkflowBlockType; from: WorkflowBlockDto | undefined; condition: string | null }) {
    const formData = new FormData();
    formData.append("workflowId", workflow.id);
    formData.append("type", type);
    if (condition) {
      formData.append("condition", condition);
    }
    if (from) {
      formData.append("fromBlockId", from.id);
    }
    startTransition(() => {
      addBlockFormAction(formData);
    });
  }

  function onConnectBlocks(params: { fromBlockId: string; toBlockId: string; condition: string | null }) {
    const formData = new FormData();
    formData.append("workflowId", workflow.id);
    formData.append("fromBlockId", params.fromBlockId);
    formData.append("toBlockId", params.toBlockId);
    if (params.condition) {
      formData.append("condition", params.condition);
    }
    startTransition(() => {
      connectBlocksFormAction(formData);
    });
  }

  function onDeleteBlock(id: string) {
    const formData = new FormData();
    formData.append("workflowId", workflow.id);
    formData.append("blockId", id);
    startTransition(() => {
      deleteBlockFormAction(formData);
    });
  }

  function onDeleteConnection(params: { fromBlockId: string; toBlockId: string } | { id: string }) {
    const formData = new FormData();
    formData.append("workflowId", workflow.id);
    if ("id" in params) {
      formData.append("connectionId", params.id);
    } else {
      formData.append("fromBlockId", params.fromBlockId);
      formData.append("toBlockId", params.toBlockId);
    }
    startTransition(() => {
      deleteConnectionFormAction(formData);
    });
  }

  function onUpdateConditionsGroups(blockId: string, conditionsGroups: WorkflowConditionsGroupDto[]) {
    const formData = new FormData();
    formData.append("workflowId", workflow.id);
    formData.append("blockId", blockId);
    formData.append("conditionsGroups", JSON.stringify(conditionsGroups));
    startTransition(() => {
      updateConditionsFormAction(formData);
    });
  }

  function onToggle(enabled: boolean) {
    const formData = new FormData();
    formData.append("workflowId", workflow.id);
    formData.append("enabled", enabled ? "true" : "false");
    startTransition(() => {
      toggleFormAction(formData);
    });
  }

  return (
    <div className="flex h-[calc(100vh-140px)]">
      <div className="flex-1">
        <WorkflowBuilder
          workflow={workflow}
          selectedBlock={selectedBlock}
          workflowExecution={null}
          onSelectedBlock={setSelectedBlock}
          onConnectBlocks={onConnectBlocks}
          onDeleteConnection={(id) => onDeleteConnection({ id })}
          onDeleteBlock={onDeleteBlock}
        />
      </div>
      <div className="w-96 overflow-y-auto border-l border-border bg-background">
        <WorkflowEditorSidebar
          workflow={workflow}
          onSave={onSave}
          selectedBlock={selectedBlock}
          addingNextBlockFrom={addingNextBlockFrom}
          onSelectedBlock={(block) => {
            setSelectedBlock(block);
          }}
          onSaveBlock={onSaveBlock}
          onSetTrigger={(type) => {
            onAddBlock({ type: type, from: undefined, condition: null });
            setAddingNextBlockFrom(null);
          }}
          onAddBlock={({ from, type, condition }) => {
            onAddBlock({ type: type, from: from, condition });
            setAddingNextBlockFrom(null);
          }}
          onAddingNextBlock={(data) => {
            setAddingNextBlockFrom(data);
          }}
          onDeleteBlock={onDeleteBlock}
          onDeleteConnection={onDeleteConnection}
          onUpdateConditionsGroups={onUpdateConditionsGroups}
        />
      </div>
    </div>
  );
}
