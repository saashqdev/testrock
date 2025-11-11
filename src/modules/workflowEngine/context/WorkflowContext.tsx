"use client";

import { createContext } from "react";

type WorkflowContextType = {
  isReadOnly: boolean;
  onEdgeDelete: (edgeId: string) => void;
  onNodeDelete: (nodeId: string) => void;
  isNodeSelected: (nodeId: string) => boolean;
};

const WorkflowContext = createContext<WorkflowContextType>({
  isReadOnly: false,
  onEdgeDelete: (edgeId) => {},
  onNodeDelete: (nodeId) => {},
  isNodeSelected: (nodeId) => false,
});

export default WorkflowContext;
