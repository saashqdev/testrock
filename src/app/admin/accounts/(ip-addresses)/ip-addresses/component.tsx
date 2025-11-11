"use client";

import { useTranslation } from "react-i18next";
import TableSimple from "@/components/ui/tables/TableSimple";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import DateUtils from "@/lib/shared/DateUtils";
import { IpAddress } from "@prisma/client";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { useTransition } from "react";
import toast from "react-hot-toast";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import { Colors } from "@/lib/enums/shared/Colors";
import { blacklistIp, deleteIpAddress } from "./actions";
import { useRouter } from "next/navigation";

interface ComponentProps {
  items: IpAddress[];
  pagination: PaginationDto;
  blacklistedIps: string[];
}

export default function Component({ items, pagination, blacklistedIps }: ComponentProps) {
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();
  const router = useRouter();

  const handleAction = async (actionFn: () => Promise<{ success?: string; error?: string }>) => {
    startTransition(async () => {
      const result = await actionFn();
      if (result?.success) {
        toast.success(result.success);
        router.refresh();
      } else if (result?.error) {
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
    >
      <TableSimple
        items={items}
        actions={[
          {
            title: "Blacklist IP",
            destructive: true,
            onClick: (_, i) => {
              handleAction(() => blacklistIp(i.ip));
            },
          },
          {
            title: "Delete",
            destructive: true,
            onClick: (_, i) => {
              handleAction(() => deleteIpAddress(i.id));
            },
          },
        ]}
        headers={[
          {
            name: "ip",
            title: t("models.tenantIpAddress.object"),
            value: (i) => (
              <div className="flex flex-col">
                <div className="font-medium">
                  {i.ip} {i.type && <span className="text-muted-foreground text-xs font-light">({i.type})</span>}{" "}
                  {blacklistedIps.includes(i.ip) && <SimpleBadge title="Blacklisted" color={Colors.RED} />}
                </div>
                <div className="text-muted-foreground text-xs">{i.provider}</div>
              </div>
            ),
          },
          {
            name: "country",
            title: "Country",
            value: (i) => (
              <div className="flex flex-col">
                <div className="font-medium">{i.countryCode}</div>
                <div className="text-muted-foreground text-xs">{i.countryName}</div>
              </div>
            ),
          },
          {
            name: "region",
            title: "Region",
            value: (i) => (
              <div className="flex flex-col">
                <div className="font-medium">{i.regionCode}</div>
                <div className="text-muted-foreground text-xs">{i.regionName}</div>
              </div>
            ),
          },
          {
            name: "city",
            title: "City",
            value: (i) => (
              <div className="flex flex-col">
                <div className="font-medium">{i.city}</div>
                <div className="text-muted-foreground text-xs">{i.zipCode}</div>
              </div>
            ),
          },
          {
            name: "metadata",
            title: "Metadata",
            value: (i) => <div className="max-w-xs truncate">{i.metadata && <ShowPayloadModalButton description={i.metadata} payload={i.metadata} />}</div>,
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => DateUtils.dateAgo(item.createdAt),
            className: "text-muted-foreground text-xs",
            breakpoint: "sm",
          },
        ]}
        pagination={pagination}
      />
    </EditPageLayout>
  );
}
