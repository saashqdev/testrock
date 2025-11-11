"use client";

import { useState } from "react";
import InputNumber from "@/components/ui/input/InputNumber";

export default function PreviewInputNumberWithAllOptions() {
  const [value, setValue] = useState<number | undefined>(undefined);
  return (
    <div id="input-number-with-all-options">
      <div className="border border-dashed border-border bg-background p-6">
        <InputNumber name="name" title="Title" value={value} onChange={setValue} min={0} max={10} required step="0.01" />
      </div>
    </div>
  );
}
