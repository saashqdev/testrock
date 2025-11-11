"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputText, { RefInputText } from "@/components/ui/input/InputText";
import { toast } from "sonner";
import UrlUtils from "@/lib/utils/UrlUtils";

type Props = {
  portalId: string;
};

export default function NewUserClient({ portalId }: Props) {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    startTransition(async () => {
      const formData = new FormData(e.currentTarget);
      formData.set("portalId", portalId);
      
      try {
        const response = await fetch(`/api/portals/${params.portal}/users/create`, {
          method: "POST",
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast.success(result.success);
          router.push(UrlUtils.currentTenantUrl(params, `portals/${params.portal}/users`));
        } else if (result.error) {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("An error occurred");
      }
    });
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <input type="hidden" name="action" value="create" readOnly />
        <div className="space-y-2">
          <InputText ref={mainInput} autoFocus name="email" title={t("models.user.email")} value={email} setValue={setEmail} required />
          <InputText type="password" name="password" title={t("account.shared.password")} value={password} setValue={setPassword} required />
          <InputText name="firstName" title={t("models.user.firstName")} value={firstName} setValue={setFirstName} required />
          <InputText name="lastName" title={t("models.user.lastName")} value={lastName} setValue={setLastName} />
        </div>
        <div className="mt-3 flex justify-between space-x-2">
          <ButtonSecondary type="button" onClick={() => router.back()}>
            {t("shared.cancel")}
          </ButtonSecondary>
          <LoadingButton type="submit" disabled={isPending}>
            {t("shared.create")}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
