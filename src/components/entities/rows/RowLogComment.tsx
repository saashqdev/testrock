"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import clsx from "clsx";
import { marked } from "marked";
import { useTranslation } from "react-i18next";
import ApiKeyBadge from "@/components/core/users/ApiKeyBadge";
import UserAvatarBadge from "@/components/core/users/UserAvatarBadge";
import UserBadge from "@/components/core/users/UserBadge";
import ChatAltIcon from "@/components/ui/icons/ChatAltIcon";
import ThumbsUpEmptyIcon from "@/components/ui/icons/ThumbsUpEmptyIcon";
import ThumbsUpFilledIcon from "@/components/ui/icons/ThumbsUpFilledIcon";
import TrashEmptyIcon from "@/components/ui/icons/TrashEmptyIcon";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { LogWithDetailsDto } from "@/db/models/logs/LogsModel";
import DateUtils from "@/lib/shared/DateUtils";

interface Props {
  item: LogWithDetailsDto;
}
export default function RowLogComment({ item }: Props) {
  const { t } = useTranslation();
  const data = useAppOrAdminData();
  const user = data?.user;
  const [isPending, startTransition] = useTransition();
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdding = isPending && currentAction === "comment-reaction";
  const isDeleting = isPending && currentAction === "comment-delete";

  async function onReacted(reaction: string) {
    setCurrentAction("comment-reaction");
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("action", "comment-reaction");
        form.set("comment-id", item.comment?.id ?? "");
        form.set("reaction", reaction);
        const search = searchParams.toString();

        await fetch(pathname + (search ? `?${search}` : ""), {
          method: "POST",
          body: form,
        });
      } catch (error) {
        console.error("Error reacting to comment:", error);
      } finally {
        setCurrentAction(null);
      }
    });
  }

  async function onDeleted() {
    setCurrentAction("comment-delete");
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("action", "comment-delete");
        form.set("comment-id", item.comment?.id ?? "");
        const search = searchParams.toString();

        await fetch(pathname + (search ? `?${search}` : ""), {
          method: "POST",
          body: form,
        });
      } catch (error) {
        console.error("Error deleting comment:", error);
      } finally {
        setCurrentAction(null);
      }
    });
  }

  function getReactions(reaction: string) {
    return item.comment?.reactions.filter((f) => f.reaction === reaction) ?? [];
  }
  function hasMyReaction(reaction: string) {
    return item.comment?.reactions.find((f) => f.createdByUserId === user?.id && f.reaction === reaction);
  }
  return (
    <>
      {item.comment && (
        <>
          <div className="relative px-1">
            <UserAvatarBadge className="h-9 w-9" avatar={item.user?.avatar} />

            <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-secondary px-0.5 py-px">
              <ChatAltIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </span>
          </div>
          <div className="group min-w-0 flex-1 space-y-0.5">
            <div>
              <div className="text-sm">
                <div className="font-medium text-foreground">
                  {item.user && <UserBadge item={item.user} withEmail={false} />}
                  {item.apiKey && <ApiKeyBadge item={item.apiKey} />}
                </div>
              </div>
            </div>
            <div className="text-sm font-normal text-muted-foreground">
              {item.comment.isDeleted ? (
                <p className="italic text-muted-foreground">{t("shared.commentDeleted")}</p>
              ) : (
                <div className="prose rounded-md border border-dashed border-border p-2 text-sm">
                  <div dangerouslySetInnerHTML={{ __html: marked(item.comment.value) }} />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between space-x-1 font-medium text-muted-foreground">
              {/* <div>{DateUtils.dateAgo(item.createdAt)}</div> */}
              <time dateTime={DateUtils.dateYMDHMS(item.createdAt)}>{DateUtils.dateAgo(item.createdAt)}</time>
              <div className="group flex items-center space-x-2">
                {!item.comment.isDeleted && item.comment.createdByUserId === user?.id && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => onDeleted()}
                    className="focus:outline-hidden invisible p-0.5 text-muted-foreground hover:text-muted-foreground group-hover:visible"
                  >
                    <div className="flex items-center space-x-1">
                      <TrashEmptyIcon className="h-4 w-4" />
                    </div>
                  </button>
                )}
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={() => onReacted("like")}
                  className={clsx(
                    "focus:outline-hidden p-0.5 text-muted-foreground hover:text-muted-foreground",
                    getReactions("like").length === 0 && "invisible group-hover:visible"
                  )}
                >
                  <div
                    className="flex items-center space-x-1"
                    title={
                      getReactions("like")
                        ?.map((f) => `${f.createdByUser?.firstName} ${f.createdByUser?.lastName}`)
                        .join(", ") ?? ""
                    }
                  >
                    {(getReactions("like")?.length ?? 0) > 0 && <div className="">{getReactions("like")?.length ?? 0}</div>}
                    {hasMyReaction("like") ? <ThumbsUpFilledIcon className="h-4 w-4" /> : <ThumbsUpEmptyIcon className="h-4 w-4" />}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
