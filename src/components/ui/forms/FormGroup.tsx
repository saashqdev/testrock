"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";
import { FormEvent, forwardRef, ReactNode, Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "../buttons/ButtonSecondary";
import LoadingButton from "../buttons/LoadingButton";
import ConfirmModal, { RefConfirmModal } from "../modals/ConfirmModal";
import ErrorModal, { RefErrorModal } from "../modals/ErrorModal";
import InfoBanner from "../banners/InfoBanner";
import ErrorBanner from "../banners/ErrorBanner";

export interface RefFormGroup {
  submitForm: () => void;
}

interface Props {
  id?: string | undefined;
  onCancel?: () => void;
  children: ReactNode;
  className?: string;
  classNameFooter?: string;
  editing?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canSubmit?: boolean;
  onSubmit?: (e: FormData) => void | Promise<void> | undefined;
  onDelete?: () => void;
  onCreatedRedirect?: string;
  confirmationPrompt?: {
    title: string;
    yesTitle?: string;
    noTitle?: string;
    description?: string;
  };
  deleteRedirect?: string;
  actionNames?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  state?: { loading?: boolean; submitting?: boolean };
  message?: {
    success?: string;
    error?: string;
  };
  labels?: {
    create?: string;
  };
  withErrorModal?: boolean;
  submitDisabled?: boolean;
}
const FormGroup = (
  {
    id,
    onCancel,
    children,
    className,
    classNameFooter,
    editing,
    canUpdate = true,
    canDelete = true,
    canSubmit = true,
    confirmationPrompt,
    onSubmit,
    onCreatedRedirect,
    deleteRedirect,
    onDelete,
    actionNames,
    state,
    message,
    labels,
    withErrorModal = true,
    submitDisabled,
  }: Props,
  ref: Ref<RefFormGroup>
) => {
  const { t } = useTranslation();

  const formRef = useRef<HTMLFormElement>(null);
  useImperativeHandle(ref, () => ({
    submitForm,
  }));
  async function submitForm() {
    const formData = new FormData(formRef.current!);
    if (onSubmit) {
      setIsSubmitting(true);
      await onSubmit(formData);
    }
  }

  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loading = isSubmitting || state?.submitting;

  const confirmRemove = useRef<RefConfirmModal>(null);
  const confirmSubmit = useRef<RefConfirmModal>(null);
  const errorModal = useRef<RefErrorModal>(null);

  const [error, setError] = useState<string>();
  const [formData, setFormData] = useState<FormData>();

  useEffect(() => {
    // Handle action data or errors from props instead of useActionData
    if (message?.error) {
      setError(message.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.error]);

  useEffect(() => {
    setError(undefined);
    if (error) {
      errorModal.current?.show(t("shared.error"), error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    // Reset submitting state when not loading from props
    if (!state?.submitting && isSubmitting) {
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.submitting]);

  useEffect(() => {
    // Handle redirect after successful creation
    if (onCreatedRedirect && !id && message?.success) {
      if (onCreatedRedirect !== "addAnother") {
        router.push(onCreatedRedirect);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCreatedRedirect, id, message?.success]);

  function remove() {
    confirmRemove.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function yesRemove() {
    if (onDelete) {
      onDelete();
    } else {
      // Handle delete action - you may need to implement this based on your API structure
      const form = new FormData();
      form.set("action", actionNames?.delete ?? "delete");
      form.set("id", id ?? "");
      form.set("redirect", deleteRedirect ?? "");
      
      if (onSubmit) {
        setIsSubmitting(true);
        onSubmit(form);
      }
      
      // If you have a delete redirect, navigate to it
      if (deleteRedirect) {
        router.push(deleteRedirect);
      }
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (confirmationPrompt) {
      e.stopPropagation();
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      setFormData(formData);
      confirmSubmit.current?.show(confirmationPrompt.title, confirmationPrompt.yesTitle, confirmationPrompt.noTitle, confirmationPrompt.description);
    }
    // If no confirmation prompt and onSubmit exists, let the form action handle it naturally
    // This allows useActionState to work correctly with the action prop
  }

  async function yesSubmit() {
    if (formData) {
      if (onSubmit !== undefined) {
        setIsSubmitting(true);
        await onSubmit(formData);
      }
    }
  }

  return (
    <form 
      ref={formRef} 
      {...(onSubmit && !confirmationPrompt ? {} : { method: "post" })}
      acceptCharset="utf-8" 
      className={clsx(className, "py-1")} 
      onSubmit={confirmationPrompt ? handleSubmit : undefined}
      action={!confirmationPrompt && onSubmit ? (onSubmit as any) : undefined}
    >
      <input type="hidden" name="action" value={id ? actionNames?.update ?? "edit" : actionNames?.create ?? "create"} hidden readOnly />
      <input type="hidden" name="id" value={id ?? ""} hidden readOnly />
      <div className="space-y-3">
        {children}

        {(!id || editing) && canSubmit && (
          <div className={clsx(classNameFooter, "flex justify-between space-x-2")}>
            <div className="flex items-center space-x-2">
              {id && canDelete && (
                <ButtonSecondary disabled={loading || !canDelete} destructive={true} type="button" onClick={remove}>
                  <div>{t("shared.delete")}</div>
                </ButtonSecondary>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {onCancel && (
                <ButtonSecondary onClick={onCancel} disabled={loading}>
                  <div>{t("shared.cancel")}</div>
                </ButtonSecondary>
              )}
              {id === undefined && onCreatedRedirect === "addAnother" ? (
                <div>
                  <LoadingButton isLoading={state?.submitting} type="submit" disabled={loading || submitDisabled}>
                    <div>{t("shared.saveAndAdd")}</div>
                  </LoadingButton>
                </div>
              ) : (
                <LoadingButton isLoading={state?.submitting} type="submit" disabled={loading || (id !== undefined && !canUpdate) || submitDisabled}>
                  {labels?.create ?? t("shared.save")}
                </LoadingButton>
              )}
            </div>

            {message && (message.success || message.error) && (
              <div>
                {message.success && <InfoBanner title={t("shared.success")} text={message.success} />}
                {message.error && <ErrorBanner title={t("shared.error")} text={message.error} />}
              </div>
            )}
          </div>
        )}
      </div>
      <ConfirmModal ref={confirmSubmit} onYes={yesSubmit} />
      <ConfirmModal ref={confirmRemove} onYes={yesRemove} destructive />
      {withErrorModal && canSubmit && <ErrorModal ref={errorModal} />}
    </form>
  );
};

export default forwardRef(FormGroup);
