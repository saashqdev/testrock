"use client";

import { useTranslation } from "react-i18next";
import TableSimple from "@/components/ui/tables/TableSimple";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import DateUtils from "@/lib/shared/DateUtils";
import { IpAddressLog } from "@prisma/client";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import { Colors } from "@/lib/enums/shared/Colors";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import DropdownSimple from "@/components/ui/dropdowns/DropdownSimple";
import DownArrow from "@/components/ui/icons/DownArrow";
import { blacklistIp, deleteLog, deleteLogs } from "./actions";

interface ComponentProps {
  items: IpAddressLog[];
  pagination: PaginationDto;
  blacklistedIps: string[];
}

export default function Component({ items: initialItems, pagination, blacklistedIps }: ComponentProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<IpAddressLog[]>(initialItems);
  const [selected, setSelected] = useState<IpAddressLog[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleBlacklistIp = async (ip: string) => {
    startTransition(async () => {
      const result = await blacklistIp(ip);
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  const handleDeleteLog = async (id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
    setItems((prev) => prev.filter((p) => p.id !== id));

    startTransition(async () => {
      const result = await deleteLog(id);
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  const handleDeleteLogs = async (ids: string[]) => {
    setSelected([]);
    setItems((prev) => prev.filter((p) => !ids.includes(p.id)));

    startTransition(async () => {
      const result = await deleteLogs(ids);
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <EditPageLayout
      tabs={[
        {
          name: "IP Addresses",
          routePath: "/admin/accounts/ip-addresses",
        },
        {
          name: "Logs",
          routePath: "/admin/accounts/ip-addresses/logs",
        },
      ]}
      buttons={<></>}
    >
      {selected.length > 0 && (
        <DropdownSimple
          right
          button={
            <div className="flex items-center space-x-2 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground/80 hover:bg-secondary">
              <div>{selected.length} selected</div>
              <DownArrow className="h-4 w-4" />
            </div>
          }
          items={[
            {
              label: `Delete ${selected.length} logs`,
              onClick: () => {
                handleDeleteLogs(selected.map((i) => i.id));
              },
            },
          ]}
        />
      )}
      <TableSimple
        items={items}
        selectedRows={selected}
        onSelected={setSelected}
        actions={[
          {
            title: "Blacklist IP",
            destructive: true,
            onClick: (_, i) => {
              handleBlacklistIp(i.ip);
            },
          },
          {
            title: "Delete",
            destructive: true,
            onClick: (_, i) => {
              handleDeleteLog(i.id);
            },
          },
        ]}
        headers={[
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => DateUtils.dateAgo(item.createdAt),
            className: "text-muted-foreground text-xs",
            breakpoint: "sm",
          },
          {
            name: "status",
            title: t("shared.status"),
            value: (i) => (
              <div className="flex flex-col">
                <div>{i.success ? <SimpleBadge title="Success" color={Colors.GREEN} /> : <SimpleBadge title="Error" color={Colors.RED} />}</div>
              </div>
            ),
          },
          {
            name: "ip",
            title: t("models.tenantIpAddress.object"),
            value: (i) => (
              <div className="flex flex-col">
                <div className="font-medium">
                  {i.ip} {blacklistedIps.includes(i.ip) && <SimpleBadge title="Blacklisted" color={Colors.RED} />}
                </div>
              </div>
            ),
          },
          {
            name: "action",
            title: "Action",
            value: (i) => (
              <div className="flex flex-col">
                <div className="font-medium">{i.action}</div>
                <div className="text-xs text-muted-foreground">{i.description}</div>
              </div>
            ),
          },
          {
            name: "url",
            title: "URL",
            value: (i) => (
              <div className="flex flex-col">
                <div className="">{i.url}</div>
              </div>
            ),
          },
          {
            name: "metadata",
            title: "Metadata",
            value: (i) => (
              <div className="max-w-xs truncate">
                {i.metadata ? <ShowPayloadModalButton description={i.metadata} payload={i.metadata} /> : <div className="italic text-muted-foreground">-</div>}
              </div>
            ),
          },
          {
            name: "error",
            title: "Error",
            value: (i) => (
              <div className="flex flex-col text-red-500">
                <div className="font-medium">{i.error}</div>
              </div>
            ),
          },
        ]}
        pagination={pagination}
      />
    </EditPageLayout>
  );
}
