"use client";

import { ApiEndpointDto } from "../dtos/ApiEndpointDto";
import CollapsibleRow from "@/components/ui/tables/CollapsibleRow";
import ApiEndpointTitle from "./ApiEndpointTitle";
import MonacoEditor from "@/components/editors/MonacoEditor";

export default function ApiEndpoint({ item }: { item: ApiEndpointDto }) {
  return (
    <div>
      <CollapsibleRow className="bg-secondary" value={<ApiEndpointTitle item={item} />} title={<ApiEndpointTitle item={item} />}>
        <div className="space-y-1 overflow-hidden pt-2">
          <div className="space-y-2">
            {item.responseSchema && (
              <>
                <div className="text-sm font-bold text-foreground">Response Schema</div>
                <div className="h-96 overflow-auto p-2">
                  <MonacoEditor value={item.responseSchema} onChange={() => {}} theme="vs-dark" language="json" />
                </div>
              </>
            )}
            {item.bodyExample && (
              <>
                <div className="text-sm font-bold text-foreground">Body Example</div>
                <div className="h-96 overflow-auto p-2">
                  <MonacoEditor value={item.bodyExample} onChange={() => {}} theme="vs-dark" language="json" />
                </div>
              </>
            )}
          </div>
          {/* <div className="flex justify-end space-x-2">
            <ButtonPrimary>Send</ButtonPrimary>
          </div> */}
        </div>
      </CollapsibleRow>
    </div>
  );
}
