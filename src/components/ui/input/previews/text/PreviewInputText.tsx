import InputText from "@/components/ui/input/InputText";

export default function PreviewInputText() {
  return (
    <div id="input-text">
      <div className="border border-dashed border-border bg-background p-6">
        <InputText name="name" title="Title" defaultValue="" />
      </div>
    </div>
  );
}
