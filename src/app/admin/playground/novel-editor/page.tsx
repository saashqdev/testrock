"use client";

import NovelEditor from "@/modules/novel/ui/editor";
import DEFAULT_EDITOR_CONTENT from "@/modules/novel/ui/editor/default-content";
import useLocalStorage from "@/hooks/use-local-storage";

export default function NovelEditorPage() {
  const [content, setContent] = useLocalStorage("playground-novel-editor", DEFAULT_EDITOR_CONTENT);
  return (
    <div>
      <NovelEditor
        content={content}
        onChange={(e) => {
          if (e.text) {
            setContent(e);
          }
        }}
      />
    </div>
  );
}
