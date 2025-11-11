import InputNumber from "@/components/ui/input/InputNumber";

export default function PreviewInputNumber() {
  return (
    <div id="input-number">
      <div className="border border-dashed border-border bg-background p-6">
        <InputNumber name="name" title="Title" defaultValue={undefined} />
      </div>
    </div>
  );
}
