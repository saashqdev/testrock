"use client";

import { BubbleMenu, BubbleMenuProps } from "@tiptap/react/menus";
import clsx from "clsx";
import { Fragment, useState } from "react";
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

type EditorBubbleMenuProps = Omit<BubbleMenuProps, "children"> & {
  promptFlows?: PromptFlowWithDetailsDto[];
  onRunPromptFlow?: (
    promptFlow: PromptFlowWithDetailsDto,
    data: {
      text: string;
      selectedText: string;
    }
  ) => void;
  tippyOptions?: any; // Add this line to allow tippyOptions
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

  const { promptFlows, onRunPromptFlow, tippyOptions, ...bubbleMenuProps } = props;

  const bubbleMenuPropsWithDefaults = {
    ...bubbleMenuProps,
    shouldShow: ({ editor }: { editor: any }) => {
      // don't show if image is selected

      if (editor?.isActive("image")) {
        return false;
      }
      return editor.view.state.selection.content().size > 0;
    },
  };

  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false);
  const [isPromptSelectorOpen, setIsPromptSelectorOpen] = useState(false);

  return (
    <BubbleMenu {...bubbleMenuPropsWithDefaults} className="flex overflow-hidden rounded border border-stone-200 bg-background shadow-xl">
      {props.editor && (
        <Fragment>
          <NodeSelector
            editor={props.editor}
            isOpen={isNodeSelectorOpen}
            setIsOpen={() => {
              setIsNodeSelectorOpen(!isNodeSelectorOpen);
              setIsColorSelectorOpen(false);
              setIsPromptSelectorOpen(false);
            }}
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
            setIsOpen={() => {
              setIsColorSelectorOpen(!isColorSelectorOpen);
              setIsNodeSelectorOpen(false);
            }}
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
