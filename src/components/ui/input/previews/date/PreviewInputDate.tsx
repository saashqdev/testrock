import InputDate from "@/components/ui/input/InputDate";

export default function PreviewInputDate() {
  return (
    <div id="input-date">
      <div className="border border-dashed border-border bg-background p-6">
        <InputDate name="name" title="Title" />
      </div>
    </div>
  );
}
