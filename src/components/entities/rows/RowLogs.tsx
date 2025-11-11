"use client";

import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { LogWithDetailsDto } from "@/db/models/logs/LogsModel";
import DateUtils from "@/lib/shared/DateUtils";

interface Props {
  items: LogWithDetailsDto[];
}

export default function RowLogs({ items }: Props) {
  const { t } = useTranslation();

  const sortedItems = () => {
    return items.slice().sort((x, y) => {
      if (x.createdAt && y.createdAt) {
        return x.createdAt > y.createdAt ? -1 : 1;
      }
      return -1;
    });
  };

  function dateDM(value: Date | undefined) {
    return DateUtils.dateDM(value);
  }

  return (
    <div>
      <div className="space-y-3">
        <h3 className="text-sm font-medium leading-3 text-foreground">
          <div className="flex items-center space-x-1">
            <div>
              <span className="font-light italic"></span> {t("app.shared.activity.title")}
            </div>
          </div>
        </h3>
        <div className="shadow-xs rounded-md border border-border bg-background px-4 py-5">
          <div className="flow-root">
            <ul className="-mb-8">
              {sortedItems().length === 0 && <div className="mb-6 flex justify-center text-sm italic text-muted-foreground">No events</div>}
              {sortedItems().map((activity, idxActivity) => {
                return (
                  <li key={idxActivity}>
                    <div className="relative pb-8">
                      {items.length > 0 && idxActivity + 1 < items.length && (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      )}

                      <div className="relative flex space-x-3">
                        <div>
                          <span className={clsx("flex h-8 w-8 items-center justify-center rounded-full bg-secondary/90 ring-8 ring-white")}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-muted-foreground"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="grow">
                          <div className="flex min-w-0 flex-1 justify-between space-x-4">
                            <div className="truncate">
                              <div className="text-sm text-muted-foreground">
                                <div className="truncate text-foreground">
                                  <span title={activity.action}>{activity.action}</span>
                                </div>
                              </div>
                            </div>
                            <div className="truncate whitespace-nowrap text-right text-xs lowercase text-muted-foreground">
                              {activity.createdAt && (
                                <time dateTime={DateUtils.dateYMDHMS(activity.createdAt)}>
                                  {dateDM(activity.createdAt)}, {DateUtils.dateHMS(activity.createdAt)}
                                </time>
                              )}
                            </div>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4">
                            {activity.user && <div className="text-xs font-light">{activity.user.email}</div>}
                            {activity.apiKey && <div className="text-xs font-light">{activity.apiKey.alias}</div>}
                            {!activity.user && !activity.apiKey && <div className="text-xs font-light">{t("shared.anonymousUser")}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
