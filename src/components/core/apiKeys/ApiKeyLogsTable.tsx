"use client";

import { useTranslation } from "react-i18next";
import DateUtils from "@/lib/shared/DateUtils";
import { useEffect, useState } from "react";
import { ApiKeyLogDto } from "@/modules/api/dtos/ApiKeyLogDto";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import { Colors } from "@/lib/enums/shared/Colors";
import TableSimple, { RowHeaderDisplayDto } from "@/components/ui/tables/TableSimple";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import ApiUtils from "@/utils/app/ApiUtils";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";

interface Props {
  items: ApiKeyLogDto[];
  withTenant: boolean;
  pagination: PaginationDto;
}

export default function ApiKeyLogsTable({ withTenant, items, pagination }: Props) {
  const { t } = useTranslation();

  const [headers, setHeaders] = useState<RowHeaderDisplayDto<ApiKeyLogDto>[]>([]);

  useEffect(() => {
    let headers: RowHeaderDisplayDto<ApiKeyLogDto>[] = [];

    headers.push({
      name: "createdAt",
      title: t("shared.createdAt"),
      value: (item) => DateUtils.dateYMDHMS(item.createdAt),
      formattedValue: (item) => <div className="text-xs text-muted-foreground">{item.createdAt && <span>{DateUtils.dateYMDHMS(item.createdAt)}</span>}</div>,
    });
    if (withTenant) {
      headers.push({
        name: "tenant",
        title: t("models.tenant.object"),
        value: (item) => item.apiKey?.tenant.name,
      });
    }
    headers.push({
      name: "alias",
      title: t("models.apiKey.alias"),
      value: (item) => item.apiKey?.alias,
      formattedValue: (item) => <div>{item.apiKey ? item.apiKey?.alias : <span className="text-gray-300">?</span>}</div>,
    });
    headers.push({
      name: "ip",
      title: t("models.apiKeyLog.ip"),
      value: (item) => item.ip,
      formattedValue: (item) => <div>{item.ip.length > 0 ? item.ip : <span className="text-gray-300">?</span>}</div>,
    });
    headers.push({
      name: "endpoint",
      title: t("models.apiKeyLog.endpoint"),
      value: (item) => item.endpoint,
    });
    headers = [
      ...headers,
      {
        name: "method",
        title: t("models.apiKeyLog.method"),
        value: (item) => item.method,
        formattedValue: (item) => (
          <div>
            <SimpleBadge title={item.method} color={ApiUtils.getMethodColor(item.method)} />
          </div>
        ),
      },
      {
        name: "status",
        title: t("models.apiKeyLog.status"),
        value: (item) => item.status,
        formattedValue: (item) => (
          <div>
            {item.status ? (
              <span>
                <SimpleBadge title={item.status.toString()} color={item.status.toString().startsWith("4") ? Colors.RED : Colors.GREEN} />
              </span>
            ) : (
              <span className="text-gray-300">?</span>
            )}
          </div>
        ),
      },
      {
        name: "duration",
        title: "Duration",
        value: (item) => (
          <div>
            <div>{item.duration ? <span>{item.duration / 1000} s</span> : <span className="text-gray-300">?</span>}</div>
          </div>
        ),
      },
      {
        name: "params",
        title: t("models.apiKeyLog.params"),
        value: (item) => <ShowPayloadModalButton description={item.params} payload={item.params} />,
      },
      {
        name: "error",
        title: "Error",
        value: (item) => <div className="text-red-500">{item.error}</div>,
      },
    ];
    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withTenant]);

  return (
    <div className="space-y-2">
      <TableSimple items={items} headers={headers} pagination={pagination} />
    </div>
  );
}
