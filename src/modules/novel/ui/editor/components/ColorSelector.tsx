"use client";

import { Editor } from "@tiptap/core";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface BubbleColorMenuItem {
  name: string;
  color: string;
}

interface ColorSelectorProps {
  editor: Editor;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ColorSelector({ editor, isOpen, setIsOpen }: ColorSelectorProps) {
  const items: BubbleColorMenuItem[] = [
    {
      name: "Default",
      color: "#000000",
    },
    {
      name: "Purple",
      color: "#9333EA",
    },
    {
      name: "Red",
      color: "#E00000",
    },
    {
      name: "Blue",
      color: "#2563EB",
    },
    {
      name: "Green",
      color: "#008A00",
    },
    {
      name: "Orange",
      color: "#FFA500",
    },
    {
      name: "Pink",
      color: "#BA4081",
    },
    {
      name: "Gray",
      color: "#A8A29E",
    },
  ];

  const activeItem = items.find(({ color }) => editor.isActive("textStyle", { color }));

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-full items-center gap-1 p-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
          onMouseDown={(e) => e.preventDefault()}
        >
          <span style={{ color: activeItem?.color || "#000000" }}>Color</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex flex-col">
          {items.map(({ name, color }, index) => (
            <button
              type="button"
              key={index}
              onClick={() => {
                editor.chain().focus().setMark("textStyle", { color }).run();
                setIsOpen(false);
              }}
              className={clsx("flex items-center justify-between rounded-sm px-2 py-1 text-sm text-stone-600 hover:bg-stone-100", {
                "text-blue-600": editor.isActive("textStyle", { color }),
              })}
            >
              <div className="flex items-center space-x-2">
                <div className="rounded-sm border border-stone-200 px-1 py-px font-medium" style={{ color }}>
                  A
                </div>
                <span>{name}</span>
              </div>
              {editor.isActive("textStyle", { color }) && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
