"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import TableSimple from "@/components/ui/tables/TableSimple";
import { useActionState, useEffect, useState, useTransition } from "react";
import ExternalLinkEmptyIcon from "@/components/ui/icons/ExternalLinkEmptyIcon";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import { PageConfiguration } from "@/modules/pageBlocks/dtos/PageConfiguration";
import Modal from "@/components/ui/modals/Modal";
import clsx from "clsx";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import { Colors } from "@/lib/enums/shared/Colors";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { defaultPages } from "@/modules/pageBlocks/pages/defaultPages";
import toast from "react-hot-toast";

type LoaderData = {
  items: PageConfiguration[];
};

type ActionData = {
  success?: string;
  error?: string;
};

export default function Component({ data, onAction }: { data: LoaderData; onAction: (formData: FormData) => Promise<ActionData | void> }) {
  const { t } = useTranslation();
  const [actionData, setActionData] = useState<ActionData | undefined>();
  const [pending, startTransition] = useTransition();
  const appOrAdminData = useAppOrAdminData();

  const [addingPage, setAddingPage] = useState(false);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData?.error);
    } else if (actionData?.success) {
      toast.success(actionData?.success);
    }
  }, [actionData]);

  function createPage({ slug, isSubpage1 }: { slug: string; isSubpage1: boolean }) {
    const form = new FormData();
    form.append("action", "create");
    form.append("slug", slug);
    form.append("isSubpage1", isSubpage1 ? "true" : "false");
    startTransition(async () => {
      const result = await onAction(form);
      if (result) {
        setActionData(result);
      }
    });
  }

  function pendingDefaultPages() {
    return defaultPages.filter((defaultPage) => !data.items.find((f) => f.slug === defaultPage));
  }

  function onCreateDefault() {
    const form = new FormData();
    form.append("action", "create-default");
    startTransition(async () => {
      const result = await onAction(form);
      if (result) {
        setActionData(result);
      }
    });
  }

  return (
    <div>
      <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
        <div className="md:border-b md:border-border md:py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-foreground">{t("pages.title")}</h3>
            <div className="flex items-center space-x-2">
              {pendingDefaultPages().length > 0 && pendingDefaultPages().length !== defaultPages.length && (
                <ButtonSecondary onClick={onCreateDefault} disabled={pending}>
                  {t("pages.actions.createDefault")}: {pendingDefaultPages().length}
                </ButtonSecondary>
              )}
              <ButtonPrimary disabled={!getUserHasPermission(appOrAdminData, "admin.pages.create") || pending} onClick={() => setAddingPage(true)}>
                {t("shared.new")}
              </ButtonPrimary>
            </div>
          </div>
        </div>

        {pendingDefaultPages().length > 0 && data.items.length === 0 ? (
          <button
            type="button"
            onClick={onCreateDefault}
            disabled={pending}
            className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border p-12 text-center hover:border-border focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <div className="flex flex-col space-y-2">
              <div className="text-sm font-medium text-foreground">{t("pages.actions.createDefault")}</div>
              <div className="text-sm text-muted-foreground">
                {t("pages.actions.createDefaultDescription")}: {defaultPages.join(", ")}
              </div>
            </div>
          </button>
        ) : (
          <TableSimple
            items={data.items.map((item) => ({ ...item, id: item.page?.id || item.slug }))}
            headers={[
              {
                name: "slug",
                title: t("pages.slug"),
                value: (item) => (
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-foreground">{item.slug}</div>
                      {item.page?.isPublished && (
                        <Link href={item.slug} target="_blank" className="text-muted-foreground hover:text-foreground">
                          <ExternalLinkEmptyIcon className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                    {item.page?.isPublished !== undefined && (
                      <SimpleBadge
                        title={item.page.isPublished ? t("shared.published") : t("shared.draft")}
                        color={item.page.isPublished ? Colors.GREEN : Colors.GRAY}
                      />
                    )}
                  </div>
                ),
              },
              {
                name: "name",
                title: t("pages.name"),
                value: (item) => item.name,
              },
            ]}
            actions={[
              {
                title: t("shared.edit"),
                onClickRoute: (_, item) => `/admin/pages/edit/${item.page?.id}`,
              },
            ]}
          />
        )}
      </div>

      <Modal className="sm:max-w-sm" open={addingPage} setOpen={setAddingPage}>
        <AddPageForm onCreate={createPage} onCancel={() => setAddingPage(false)} disabled={pending} />
      </Modal>
    </div>
  );
}

function AddPageForm({
  onCreate,
  onCancel,
  disabled,
}: {
  onCreate: ({ slug, isSubpage1 }: { slug: string; isSubpage1: boolean }) => void;
  onCancel: () => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const [slug, setSlug] = useState("");
  const [isSubpage1, setIsSubpage1] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onCreate({ slug, isSubpage1 });
  }

  return (
    <form onSubmit={onSubmit} className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
      <input type="hidden" name="action" value="new" readOnly hidden />
      <div className="space-y-2">
        <div className="border-b border-border px-4 py-5 sm:p-6">
          <div className="grid grid-cols-6 gap-2">
            <div className="col-span-6">
              <label htmlFor="slug" className="block text-xs font-medium text-foreground sm:text-sm">
                {t("pages.slug")}
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-border bg-muted px-3 text-sm text-muted-foreground">/</span>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  autoComplete="off"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={clsx(
                    "block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent-foreground focus:outline-none focus:ring-1 focus:ring-accent-foreground sm:text-sm",
                    isSubpage1 && "rounded-r-none border-r-0"
                  )}
                  placeholder="pricing"
                />
                {isSubpage1 && (
                  <span className="inline-flex items-center rounded-r-md border border-l-0 border-border bg-muted px-3 text-sm text-muted-foreground">
                    /:id
                  </span>
                )}
              </div>
            </div>

            <div className="col-span-6">
              <InputCheckboxWithDescription
                name="isSubpage1"
                title={t("pages.isSubpage")}
                description={
                  <span>
                    {t("pages.isSubpageDescription")}: <span className="italic">/pricing/:id</span>
                  </span>
                }
                value={isSubpage1}
                onChange={setIsSubpage1}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between space-x-2 bg-muted px-4 py-3 sm:px-6">
          <div></div>
          <div className="flex space-x-2">
            <ButtonSecondary disabled={disabled} type="button" onClick={onCancel}>
              {t("shared.cancel")}
            </ButtonSecondary>
            <ButtonPrimary disabled={disabled} type="submit">
              {t("shared.create")}
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </form>
  );
}
