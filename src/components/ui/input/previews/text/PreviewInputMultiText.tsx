import InputMultiText from "../../InputMultiText";

export default function PreviewInputMultiText() {
  return (
    <div id="input-text">
      <div className="border border-dashed border-border bg-background p-6">
        <InputMultiText name="name" title="Title" />
      </div>
    </div>
  );
}
