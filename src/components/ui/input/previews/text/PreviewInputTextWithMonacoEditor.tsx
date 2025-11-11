"use client";

import { marked } from "marked";
import { useState } from "react";
import InputText from "@/components/ui/input/InputText";

export default function PreviewInputTextWithMonacoEditor() {
  const [markdownValue, setMarkdownValue] = useState(`
  # Markdown Editor
  
  ## Title 1

  Lorem ipsum dolor sit amet, consectetur adipiscing elit.

  _Image_:

  ![TheRock](https://yahooder.sirv.com/therock/seo/cover-dark.png)
  `);
  return (
    <div id="input-text">
      <div className="border border-dashed border-border bg-background p-6">
        <div className="sm:grid sm:grid-cols-2 sm:gap-2">
          <InputText
            className="h-64"
            name="editor"
            title="Editor"
            editor="monaco"
            editorLanguage="markdown"
            editorHideLineNumbers={true}
            value={markdownValue}
            setValue={setMarkdownValue}
          />

          <div className="h-64 space-y-1 overflow-auto">
            <label className="text-xs font-medium text-muted-foreground">Preview</label>
            <div className="prose rounded-md border-2 border-dashed border-border p-6">
              <div dangerouslySetInnerHTML={{ __html: marked(markdownValue) ?? "" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
