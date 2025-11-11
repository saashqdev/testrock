"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { useTranslation } from "react-i18next";
import FormGroup from "@/components/ui/forms/FormGroup";
import InputText, { RefInputText } from "@/components/ui/input/InputText";
import { useRouter } from "next/navigation";
import { TenantTypeWithDetailsDto } from "@/db/models/accounts/TenantTypesModel";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import InputCheckboxCards from "@/components/ui/input/InputCheckboxCards";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";

export function TenantTypeForm({ 
  item, 
  allSubscriptionProducts,
  onSubmit,
  action,
  state,
  message
}: { 
  item?: TenantTypeWithDetailsDto; 
  allSubscriptionProducts: SubscriptionProductDto[];
  onSubmit?: (formData: FormData) => void | Promise<void>;
  action?: (formData: FormData) => Promise<{ error?: string } | void>;
  state?: { loading?: boolean; submitting?: boolean };
  message?: { success?: string; error?: string };
}) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const router = useRouter();

  const [title, setTitle] = useState(item?.title || "");
  const [titlePlural, setTitlePlural] = useState(item?.titlePlural || "");
  const [description, setDescription] = useState(item?.description || "");
  const [isDefault, setIsDefault] = useState(item?.isDefault || false);
  const [subscriptionProducts, setSubscriptionProducts] = useState(item?.subscriptionProducts.map((p) => p.id) || []);
  const [error, setError] = useState<string | undefined>(message?.error);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const input = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      input.current?.input.current?.focus();
    }, 100);
  }, []);

  async function handleSubmit(formData: FormData) {
    if (onSubmit) {
      await onSubmit(formData);
    } else if (action) {
      setIsSubmitting(true);
      setError(undefined);
      try {
        const result = await action(formData);
        if (result && 'error' in result && result.error) {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <FormGroup
      id={item?.id}
      onCancel={() => router.push("/admin/settings/accounts/types")}
      editing={true}
      canDelete={getUserHasPermission(appOrAdminData, "admin.accountTypes.delete")}
      onSubmit={handleSubmit}
      state={{ ...state, submitting: isSubmitting }}
      message={{ ...message, error: error }}
    >
      <div className="space-y-2">
        <InputText ref={input} autoFocus name="title" title={t("shared.title")} value={title} setValue={setTitle} required />
        <InputText name="titlePlural" title={t("shared.titlePlural")} value={titlePlural} setValue={setTitlePlural} required />
        <InputText name="description" title={t("shared.description")} value={description} setValue={setDescription} />
        <InputCheckboxWithDescription
          name="isDefault"
          title="Is default"
          value={isDefault}
          onChange={setIsDefault}
          description="All new tenants will be created with this type."
        />
        <Fragment>
          {subscriptionProducts?.map((item, idx) => {
            return <input key={idx} type="hidden" name={`subscriptionProducts[]`} value={item} />;
          })}
          <InputCheckboxCards
            columns={1}
            title={t("models.subscriptionProduct.plural")}
            value={subscriptionProducts}
            onChange={(e) => setSubscriptionProducts(e as string[])}
            display={"name"}
            options={allSubscriptionProducts.map((f) => {
              return {
                value: f.id ?? "",
                name: t(f.title),
              };
            })}
          />
        </Fragment>
        <input type="hidden" name="action" value="create" hidden readOnly />
      </div>
    </FormGroup>
  );
}
