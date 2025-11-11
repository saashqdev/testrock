"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "@/lib/enums/shared/Colors";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import DateCell from "@/components/ui/dates/DateCell";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import InputText from "@/components/ui/input/InputText";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import Modal from "@/components/ui/modals/Modal";
import TableSimple from "@/components/ui/tables/TableSimple";

type SupabaseBucketDto = { id: string; name: string; public: boolean; created_at: string; updated_at: string };

type LoaderData = {
  buckets: {
    data: SupabaseBucketDto[];
    error: any;
  };
  files: {
    [bucketId: string]: {
      data?: any[];
      error?: any;
    };
  };
  error?: string;
};

type ActionResult = {
  success?: string;
  error?: string;
};

type BucketsClientProps = {
  data: LoaderData;
  createBucket: (formData: FormData) => Promise<ActionResult>;
  updateBucket: (formData: FormData) => Promise<ActionResult>;
  deleteBucket: (formData: FormData) => Promise<ActionResult>;
};

export default function BucketsClient({ 
  data, 
  createBucket, 
  updateBucket, 
  deleteBucket 
}: BucketsClientProps) {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<SupabaseBucketDto>();
  const [actionResult, setActionResult] = useState<ActionResult>();

  return (
    <IndexPageLayout
      title="Supabase Playground - Buckets"
      buttons={
        <>
          <ButtonPrimary onClick={() => setIsAdding(true)}>Create</ButtonPrimary>
        </>
      }
    >
      {data.error ?? data.buckets.error ? (
        <ErrorBanner title="Error" text={data.error ?? data.buckets.error?.toString()} />
      ) : (
        <div>
          <TableSimple
            items={data.buckets.data.sort((a, b) => b.created_at.localeCompare(a.created_at))}
            headers={[
              { name: "id", title: "ID", value: (i) => i.id, className: "w-full" },
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
                name: "visibility",
                title: "Visibility",
                value: (i) => (i.public ? <SimpleBadge title="Public" color={Colors.GREEN} /> : <SimpleBadge title="Private" color={Colors.RED} />),
              },
              {
                name: "files",
                title: "Files",
                value: (i) => data.files[i.id]?.data?.length ?? 0,
              },
            ]}
            actions={[
              {
                title: "Edit",
                onClick: (_, i) => setIsEditing(i),
              },
              {
                title: "Files",
                onClickRoute: (_, i) => `${i.id}`,
              },
            ]}
          />
        </div>
      )}

      <Modal size="md" open={isAdding} setOpen={() => setIsAdding(false)}>
        <BucketForm 
          createAction={createBucket}
          onClose={() => {
            setIsAdding(false);
            setActionResult(undefined);
          }}
          actionResult={actionResult}
          setActionResult={setActionResult}
        />
      </Modal>

      <Modal size="md" open={!!isEditing} setOpen={() => setIsEditing(undefined)}>
        <BucketForm 
          item={isEditing} 
          updateAction={updateBucket}
          deleteAction={deleteBucket}
          onClose={() => {
            setIsEditing(undefined);
            setActionResult(undefined);
          }}
          actionResult={actionResult}
          setActionResult={setActionResult}
        />
      </Modal>
    </IndexPageLayout>
  );
}

function BucketForm({ 
  item,
  createAction,
  updateAction,
  deleteAction,
  onClose,
  actionResult,
  setActionResult,
}: { 
  item?: SupabaseBucketDto;
  createAction?: (formData: FormData) => Promise<ActionResult>;
  updateAction?: (formData: FormData) => Promise<ActionResult>;
  deleteAction?: (formData: FormData) => Promise<ActionResult>;
  onClose: () => void;
  actionResult?: ActionResult;
  setActionResult: (result: ActionResult | undefined) => void;
}) {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (actionResult?.success) {
      onClose();
    }
  }, [actionResult, onClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      let result: ActionResult;
      if (item && updateAction) {
        result = await updateAction(formData);
      } else if (createAction) {
        result = await createAction(formData);
      } else {
        return;
      }
      setActionResult(result);
    });
  }

  async function onDelete() {
    if (!item || !deleteAction || !confirm("Are you sure?")) {
      return;
    }
    const formData = new FormData();
    formData.set("id", item.id);
    
    startTransition(async () => {
      const result = await deleteAction(formData);
      setActionResult(result);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <div>
        {item ? (
          <>
            <h2 className="text-xl font-bold">Edit Bucket</h2>
            <input type="hidden" name="id" value={item.id} />
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">Create Bucket</h2>
          </>
        )}
      </div>
      <InputText name="name" title="Name" defaultValue={item?.name} disabled={!!item?.name} />
      <InputCheckboxWithDescription 
        name="public" 
        title="Public" 
        description="Files will be publicly accessible" 
        value={item?.public} 
      />

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

      {actionResult?.error && <ErrorBanner title="Error" text={actionResult.error} />}
    </form>
  );
}
