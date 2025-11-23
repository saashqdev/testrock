import Loading from "./Loading";

export default function PreviewLoaders() {
  return (
    <div id="loaders">
      <div className="not-prose border border-dashed border-border bg-background p-6">
        <div id="buttons" className="w-full space-y-2">
          <Loading loading={true} />
        </div>
      </div>
    </div>
  );
}
