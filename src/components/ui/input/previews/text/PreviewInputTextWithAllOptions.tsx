"use client";

import { useState } from "react";
import InputText from "@/components/ui/input/InputText";

export default function PreviewInputTextWithAllOptions() {
  const [value, setValue] = useState("");
  return (
    <div id="input-text-with-all-options">
      <div className="border border-dashed border-border bg-background p-6">
        <InputText name="name" title="Title" value={value} setValue={setValue} minLength={0} maxLength={10} required />
      </div>
    </div>
  );
}
