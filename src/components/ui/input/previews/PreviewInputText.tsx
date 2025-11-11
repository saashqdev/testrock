import InputText from "../InputText";

export default function PreviewInputText() {
  return (
    <div id="input-text">
      <div className="border border-dashed border-border bg-background p-6">
        <InputText name="name" title="Title" defaultValue={undefined} />
      </div>
    </div>
  );
}
