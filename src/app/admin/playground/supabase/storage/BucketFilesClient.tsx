"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { MediaDto } from "@/lib/dtos/entities/MediaDto";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import DateCell from "@/components/ui/dates/DateCell";
import InputMedia from "@/components/ui/input/InputMedia";
import InputText from "@/components/ui/input/InputText";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import PreviewMediaModal from "@/components/ui/media/PreviewMediaModal";
import Modal from "@/components/ui/modals/Modal";
import TableSimple from "@/components/ui/tables/TableSimple";
import { deleteSupabaseFile, getSupabaseFilePublicUrl, storeSupabaseFile } from "@/utils/integrations/supabaseService";
import { getSupabaseFiles } from "@/utils/integrations/supabaseService";

type SupabaseFileDto = { id: string; name: string };

type LoaderData = {
  files: Awaited<ReturnType<typeof getSupabaseFiles>>;
  error?: string;
};

type ActionData = {
  success?: string;
  error?: string;
  publicUrl?: string;
};

export function BucketFilesClient({ initialData, bucketId }: { initialData: LoaderData; bucketId: string }) {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<SupabaseFileDto>();
  const [previewFile, setPreviewFile] = useState<File>();
  const [actionData, setActionData] = useState<ActionData>();

  useEffect(() => {
    if (actionData) {
      setIsAdding(false);
      setIsEditing(undefined);
    }
    if (actionData?.publicUrl) {
      window.open(actionData.publicUrl, "_blank");
    }
  }, [actionData]);

  async function onDownload(item: SupabaseFileDto) {
    try {
      const publicUrl = await getSupabaseFilePublicUrl(bucketId, item.name);
      if (!publicUrl) {
        setActionData({ error: "Error getting file" });
      } else {
        window.open(publicUrl, "_blank");
      }
    } catch (error) {
      setActionData({ error: "Error downloading file" });
    }
  }

  return (
    <EditPageLayout
      title="Supabase Playground - Files"
      withHome={false}
      menu={[
        {
          title: "Buckets",
          routePath: "/admin/playground/supabase/storage/buckets",
        },
        {
          title: Array.isArray(params.id) ? params.id.join("/") : (params.id ?? ""),
          routePath: "/admin/playground/supabase/storage/buckets",
        },
      ]}
      buttons={
        <>
          <ButtonPrimary onClick={() => setIsAdding(true)}>Add file</ButtonPrimary>
        </>
      }
    >
      {(initialData.error ?? initialData.files.error) ? (
        <ErrorBanner title="Error" text={initialData.error ?? initialData.files.error?.message} />
      ) : (
        <div>
          <TableSimple
            items={initialData.files.data}
            headers={[
              { name: "id", title: "ID", value: (i) => i.id },
              { name: "name", title: "Name", value: (i) => i.name },
              {
                name: "metadata",
                title: "Metadata",
                value: (i) => (
                  <pre className="max-w-xs truncate">
                    <ShowPayloadModalButton title="Metadata" payload={JSON.stringify(i.metadata, null, 2)} />
                  </pre>
                ),
              },
              {
                name: "createdAt",
                title: t("shared.createdAt"),
                value: (i) => <DateCell date={new Date(i.created_at)} />,
              },
              {
                name: "updatedAt",
                title: t("shared.updatedAt"),
                value: (i) => (i.updated_at ? <DateCell date={new Date(i.updated_at)} /> : null),
              },
              {
                name: "lastAccessedAt",
                title: t("shared.lastAccessedAt"),
                value: (i) => (i.last_accessed_at ? <DateCell date={new Date(i.last_accessed_at)} /> : null),
              },
            ]}
            actions={[
              {
                title: "Download",
                onClick: (_, i) => onDownload(i),
                firstColumn: true,
              },
              {
                title: "Edit",
                onClick: (_, i) => setIsEditing(i),
              },
            ]}
          />
        </div>
      )}

      {previewFile && (
        <PreviewMediaModal
          item={{
            title: "Preview",
            type: previewFile.type,
            name: previewFile.name,
            file: previewFile.toString(),
          }}
          onClose={() => setPreviewFile(undefined)}
          onDownload={() => {
            const downloadLink = document.createElement("a");
            downloadLink.href = previewFile.toString();
            downloadLink.download = previewFile.name;
            document.body.appendChild(downloadLink);
            downloadLink.click();
          }}
        />
      )}

      <Modal size="md" open={isAdding} setOpen={() => setIsAdding(false)}>
        <FileForm
          bucketId={bucketId}
          onSuccess={(data) => {
            setActionData(data);
            startTransition(() => {
              router.refresh();
            });
          }}
        />
      </Modal>

      <Modal size="md" open={!!isEditing} setOpen={() => setIsEditing(undefined)}>
        <FileForm
          bucketId={bucketId}
          item={isEditing}
          onSuccess={(data) => {
            setActionData(data);
            startTransition(() => {
              router.refresh();
            });
          }}
        />
      </Modal>
    </EditPageLayout>
  );
}

function FileForm({ item, bucketId, onSuccess }: { item?: SupabaseFileDto; bucketId: string; onSuccess: (data: ActionData) => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionData, setActionData] = useState<ActionData>();

  async function onDelete() {
    if (!item || !confirm("Are you sure?")) {
      return;
    }
    try {
      await deleteSupabaseFile(bucketId, item.name);
      const successData = { success: "File deleted" };
      setActionData(successData);
      onSuccess(successData);
    } catch (error) {
      setActionData({ error: "Error deleting file" });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name")?.toString();

    if (!name) {
      setActionData({ error: "Missing name" });
      return;
    }

    const filesData: MediaDto[] = formData.getAll("files[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    if (filesData.length !== 1) {
      setActionData({ error: "Missing file" });
      return;
    }

    try {
      const storedFile = await storeSupabaseFile({
        bucket: bucketId,
        content: filesData[0].file,
        id: name,
        replace: true,
      });

      if (!storedFile) {
        setActionData({ error: "Error creating file" });
      } else {
        const successData = { success: "File saved: " + storedFile };
        setActionData(successData);
        onSuccess(successData);
      }
    } catch (error) {
      setActionData({ error: "Error saving file" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <div>
        {item ? (
          <>
            <h2 className="text-xl font-bold">Edit File</h2>
            <input type="hidden" name="id" value={item.id} readOnly />
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">Create File</h2>
          </>
        )}
      </div>
      <InputText readOnly={!!item} name="name" title="Name" defaultValue={item?.name} />
      <InputMedia name="files" title="File" min={1} max={1} />

      <div className="flex justify-between space-x-2">
        <div>
          {item && (
            <ButtonSecondary disabled={isPending} destructive onClick={onDelete}>
              Delete
            </ButtonSecondary>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <LoadingButton type="submit" disabled={isPending}>
            Save
          </LoadingButton>
        </div>
      </div>

      {actionData?.error && <ErrorBanner title="Error" text={actionData.error} />}
    </form>
  );
}
