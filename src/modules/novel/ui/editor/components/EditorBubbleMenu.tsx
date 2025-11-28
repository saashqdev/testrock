"use client";

import { BubbleMenu, BubbleMenuProps } from "@tiptap/react/menus";
import clsx from "clsx";
import { Fragment, useState, useRef } from "react";
import { BoldIcon, ItalicIcon, UnderlineIcon, CodeIcon } from "lucide-react";
import { NodeSelector } from "./NodeSelector";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import ColorSelector from "./ColorSelector";
import { PromptSelector } from "./PromptSelector";

// million-ignore

export interface BubbleMenuItem {
  name: string;
  isActive: () => boolean;
  command: () => void;
  icon: typeof BoldIcon;
}

type EditorBubbleMenuProps = {
  editor: BubbleMenuProps["editor"];
  promptFlows?: PromptFlowWithDetailsDto[];
  onRunPromptFlow?: (
    promptFlow: PromptFlowWithDetailsDto,
    data: {
      text: string;
      selectedText: string;
    }
  ) => void;
};

export const EditorBubbleMenu: React.FC<EditorBubbleMenuProps> = (props) => {
  const items: BubbleMenuItem[] = [
    {
      name: "bold",
      isActive: () => props.editor?.isActive("bold") ?? false,
      command: () => props.editor?.chain().focus().toggleMark("bold").run(),
      icon: BoldIcon,
    },
    {
      name: "italic",
      isActive: () => props.editor?.isActive("italic") ?? false,
      command: () => props.editor?.chain().focus().toggleMark("italic").run(),
      icon: ItalicIcon,
    },
    {
      name: "underline",
      isActive: () => props.editor?.isActive("underline") ?? false,
      command: () => props.editor?.chain().focus().toggleMark("underline").run(),
      icon: UnderlineIcon,
    },
    // {
    //   name: "strike",
    //   isActive: () => props.editor?.isActive("strike") ?? false,
    //   command: () => props.editor?.chain().focus().toggleStrike().run(),
    //   icon: StrikethroughIcon,
    // },
    {
      name: "code",
      isActive: () => props.editor?.isActive("code") ?? false,
      command: () => props.editor?.chain().focus().toggleMark("code").run(),
      icon: CodeIcon,
    },
  ];

  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false);
  const [isPromptSelectorOpen, setIsPromptSelectorOpen] = useState(false);
  
  const isAnyOpen = useRef(false);

  const { editor, promptFlows, onRunPromptFlow } = props;

  const handleNodeSelectorChange = (open: boolean) => {
    isAnyOpen.current = open;
    setIsNodeSelectorOpen(open);
    if (open) {
      setIsColorSelectorOpen(false);
      setIsPromptSelectorOpen(false);
    }
  };

  const handleColorSelectorChange = (open: boolean) => {
    isAnyOpen.current = open;
    setIsColorSelectorOpen(open);
    if (open) {
      setIsNodeSelectorOpen(false);
      setIsPromptSelectorOpen(false);
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      className="flex rounded border border-stone-200 bg-background shadow-xl"
      shouldShow={({ editor }: { editor: any }) => {
        // don't show if image is selected
        if (editor?.isActive("image")) {
          return false;
        }
        // Keep menu open if any selector is open
        if (isAnyOpen.current || isNodeSelectorOpen || isColorSelectorOpen || isPromptSelectorOpen) {
          return true;
        }
        return editor.view.state.selection.content().size > 0;
      }}
      updateDelay={0}
    >
      {props.editor && (
        <Fragment>
          <NodeSelector
            editor={props.editor}
            isOpen={isNodeSelectorOpen}
            setIsOpen={handleNodeSelectorChange}
          />
          {items.map((item, index) => (
            <button key={index} onClick={item.command} type="button" className="p-2 text-stone-600 hover:bg-stone-100 active:bg-stone-200">
              <item.icon
                className={clsx("h-4 w-4", {
                  "text-blue-500": item.isActive(),
                })}
              />
            </button>
          ))}
          <ColorSelector
            editor={props.editor}
            isOpen={isColorSelectorOpen}
            setIsOpen={handleColorSelectorChange}
          />
          {/* <ColorSelector
        editor={props.editor}
        isOpen={isColorSelectorOpen}
        setIsOpen={() => {
          setIsColorSelectorOpen(!isColorSelectorOpen);
          setIsNodeSelectorOpen(false);
        }}
      /> */}

          {promptFlows && onRunPromptFlow && promptFlows.length > 0 && (
            <PromptSelector
              items={promptFlows}
              editor={props.editor}
              isOpen={isPromptSelectorOpen}
              setIsOpen={() => {
                setIsPromptSelectorOpen(!isPromptSelectorOpen);
                setIsNodeSelectorOpen(false);
              }}
              onRun={onRunPromptFlow}
            />
          )}
        </Fragment>
      )}
    </BubbleMenu>
  );
};
