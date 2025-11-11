"use client";

import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputText, { RefInputText } from "@/components/ui/input/InputText";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategorySectionWithDetailsDto } from "@/db/models/knowledgeBase/KbCategorySectionsModel";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import KbSortArticles from "../articles/KbSortArticles";

export default function KbCategorySectionForm({
  knowledgeBase,
  category,
  language,
  item,
  onDelete,
}: {
  knowledgeBase: KnowledgeBaseDto;
  category: KnowledgeBaseCategoryWithDetailsDto;
  language: string;
  item?: KnowledgeBaseCategorySectionWithDetailsDto;
  onDelete?: () => void;
}) {
  const { pending } = useFormStatus();
  const router = useRouter();

  // const [showFilterModal, setShowFilterModal] = useState<{ item?: { type: FeatureFlagsFilterType; value: string | null }; idx?: number }>();

  const mainInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      mainInput.current?.input.current?.focus();
    }, 100);
  }, []);

  const [title, setTitle] = useState(item?.title || "");
  const [description, setDescription] = useState(item?.description || "");

  return (
    <div>
      <form method="post" className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <input type="hidden" name="action" value={item ? "edit" : "new"} hidden readOnly />
        <div className="space-y-2">
          <InputText ref={mainInput} autoFocus name="title" title={"Title"} value={title} setValue={setTitle} required />
          <InputText name="description" title={"Description"} value={description} setValue={setDescription} />
          {item && <KbSortArticles items={item.articles.sort((a, b) => a.order - b.order)} />}
        </div>
        <div className="mt-5 flex justify-between space-x-2 sm:mt-6">
          <div>
            {onDelete && (
              <ButtonSecondary disabled={pending || (item?.articles ?? []).length > 0} type="button" className="w-full" onClick={onDelete} destructive>
                <div>{"Delete"}</div>
              </ButtonSecondary>
            )}
          </div>
          <div className="flex space-x-2">
            <ButtonSecondary onClick={() => router.push(`/admin/knowledge-base/bases/${knowledgeBase.slug}/categories/${language}`)}>
              {"Cancel"}
            </ButtonSecondary>
            <LoadingButton actionName={item ? "edit" : "new"} type="submit" disabled={pending}>
              {"Save"}
            </LoadingButton>
          </div>
        </div>
      </form>
    </div>
  );
}
