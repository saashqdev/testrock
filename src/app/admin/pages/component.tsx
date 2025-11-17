"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import TableSimple from "@/components/ui/tables/TableSimple";
import { useEffect, useState, useTransition } from "react";
import ExternalLinkEmptyIcon from "@/components/ui/icons/ExternalLinkEmptyIcon";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import { PageConfiguration } from "@/modules/pageBlocks/dtos/PageConfiguration";
import Modal from "@/components/ui/modals/Modal";
import clsx from "clsx";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import { Colors } from "@/lib/enums/shared/Colors";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { defaultPages } from "@/modules/pageBlocks/utils/defaultPages";
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
        <div className="md:border-border md:border-b md:py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground text-lg font-medium leading-6">{t("pages.title")}</h3>
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
            className="border-border hover:border-border relative block w-full rounded-lg border-2 border-dashed p-12 text-center focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <div className="flex flex-col space-y-2">
              <div className="text-sm font-bold">{t("pages.actions.createDefault")}</div>
              <div className="text-xs">
                {pendingDefaultPages()
                  .map((f) => (f === "/" ? "Landing" : f))
                  .join(", ")}
              </div>
            </div>
          </button>
        ) : (
          <TableSimple
            items={data.items.map((item) => ({ ...item, id: item.page?.id ?? item.slug }))}
            headers={[
              {
                name: "slug",
                title: "Slug",
                value: (item) => <div>{item.slug}</div>,
              },
              {
                name: "title",
                title: "Title",
                className: "w-full",
                value: (i) => <div className=" w-40 truncate">{i.page?.metaTags.find((f: { name: string }) => f.name === "title")?.value}</div>,
              },
              {
                name: "blocks",
                title: "Blocks",
                value: (i) => (i.page?.blocks ?? []).length,
              },
              {
                name: "metaTags",
                title: "Meta tags",
                value: (i) => (i.page?.metaTags ?? []).length,
              },
              {
                name: "status",
                title: "Status",
                value: (i) => (
                  <div>
                    {i.page?.isPublished && i.page.isPublic && <SimpleBadge title="Public" color={Colors.GREEN} />}
                    {i.page?.isPublished && !i.page.isPublic && <SimpleBadge title="Private" color={Colors.INDIGO} />}
                    {!i.page?.isPublished && <SimpleBadge title="Unpublished" color={Colors.RED} />}
                  </div>
                ),
              },
              {
                name: "actions",
                title: "Actions",
                value: (item) => (
                  <div className="flex items-center space-x-3">
                    <a href={item.slug} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-muted-foreground hover:underline">
                      <ExternalLinkEmptyIcon className="h-4 w-4" />
                    </a>
                    <Link href={`/admin/pages/edit/${item.page?.id}/blocks`} className="text-muted-foreground hover:text-muted-foreground hover:underline">
                      Blocks
                    </Link>
                    <Link href={`/admin/pages/edit/${item.page?.id}/seo`} className="text-muted-foreground hover:text-muted-foreground hover:underline">
                      SEO
                    </Link>
                    <Link href={`/admin/pages/edit/${item.page?.id}/settings`} className="text-muted-foreground hover:text-muted-foreground hover:underline">
                      Settings
                    </Link>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>

      <AddPageModal open={addingPage} onClose={() => setAddingPage(false)} onCreate={createPage} />
    </div>
  );
}

function AddPageModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: ({ slug, isSubpage1 }: { slug: string; isSubpage1: boolean }) => void;
}) {
  const { t } = useTranslation();
  const [slug, setSlug] = useState("");
  const [isSubpage1, setIsSubpage1] = useState(false);
  
  function create() {
    onCreate({ slug, isSubpage1 });
  }
  
  return (
    <Modal open={open} setOpen={onClose} size="md">
      <div className="bg-background inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-foreground text-lg font-medium leading-6">Add page</h3>
        </div>
        <div className="mt-4 space-y-2">
          <div className="relative mt-1 rounded-md shadow-2xs">
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace("/", ""))}
              type="text"
              name="slug"
              id="slug"
              className="border-border focus:border-border block w-full rounded-md focus:ring-gray-500 sm:text-sm"
              placeholder={"Slug"}
            />
          </div>
          <InputCheckboxWithDescription
            name="isSubpage1"
            title="Is subpage :id1"
            value={isSubpage1}
            onChange={(e) => setIsSubpage1(Boolean(e))}
            description={`If checked, the page will be available at /${slug}/:id1`}
          />
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <button
            type="button"
            className={clsx(
              "inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base  font-medium text-white shadow-2xs  focus:outline-hidden focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm",
              "bg-foreground text-background"
            )}
            onClick={create}
          >
            {t("shared.create")}
          </button>
          <button
            type="button"
            className="hover:bg-secondary border-border bg-background text-foreground/80 mt-3 inline-flex w-full justify-center rounded-md border px-4 py-2 text-base font-medium shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
            onClick={onClose}
          >
            {t("shared.back")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
