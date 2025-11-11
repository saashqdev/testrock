"use client";

import { useEffect, useRef, useState } from "react";
import FormGroup from "@/components/ui/forms/FormGroup";
import InputText, { RefInputText } from "@/components/ui/input/InputText";

interface Props {
  item?: { id: string; name: string; value: string };
  action?: (formData: FormData) => void;
  pending?: boolean;
  tenantId?: string;
}

export default function WorkflowVariableForm({ item, action, pending, tenantId }: Props) {
  const [name, setName] = useState<string>(item?.name || "");
  const [value, setValue] = useState<string>(item?.value ?? "");

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  function isValidName(name: string) {
    // Regular expression for lowercase alphanumeric with dashes
    const regex = /^[a-zA-Z0-9-_]+$/;

    // Test the variable name against the regular expression
    return regex.test(name);
  }

  return (
    <FormGroup id={item?.id} editing={true} onSubmit={action}>
      <input type="hidden" name="id" value={item?.id || ""} />
      <input type="hidden" name="action" value="edit" />
      <input type="hidden" name="tenantId" value={tenantId || ""} />
      <InputText
        ref={mainInput}
        name="name"
        title="Name"
        value={name}
        setValue={setName}
        required
        disabled={!!item?.id || pending}
        placeholder="i.e. gptModel"
        autoComplete="off"
      />
      {name && !isValidName(name) && (
        <div className="text-sm text-red-600">
          <p>Invalid variable name. Don&apos;t use spaces or special characters.</p>
        </div>
      )}
      <InputText name="value" title="Value" value={value} setValue={setValue} required placeholder="i.e. gpt-4" autoComplete="off" disabled={pending} />
    </FormGroup>
  );
}
