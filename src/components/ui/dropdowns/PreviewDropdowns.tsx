"use client";

import PreviewDropdownsSimple from "./PreviewDropdownsSimple";
import PreviewDropdownsWithClick from "./PreviewDropdownsWithClick";

export default function PreviewDropdowns() {
  return (
    <div id="dropdowns">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Dropdowns - Simple</h3>
        <div className="space-x-2 border border-dashed border-border bg-background p-6">
          <PreviewDropdownsSimple />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium">Dropdowns</h3>
        <div className="space-x-2 border border-dashed border-border bg-background p-6">
          <PreviewDropdownsWithClick />
        </div>
      </div>
    </div>
  );
}
