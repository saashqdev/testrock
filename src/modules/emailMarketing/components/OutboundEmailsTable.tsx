"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { Colors } from "@/lib/enums/shared/Colors";
import { OutboundEmailWithDetailsDto } from "@/db/models/email/OutboundEmailsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import RowHelper from "@/lib/helpers/RowHelper";
import DateUtils from "@/lib/shared/DateUtils";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import XIcon from "@/components/ui/icons/XIcon";
import Modal from "@/components/ui/modals/Modal";
import TableSimple, { type RowHeaderDisplayDto } from "@/components/ui/tables/TableSimple";

export default function OutboundEmailsTable({
  items,
  pagination,
  withCampaign,
  allEntities,
}: {
  items: OutboundEmailWithDetailsDto[];
  pagination?: PaginationDto;
  withCampaign?: boolean;
  allEntities: EntityWithDetailsDto[];
}) {
  const { t } = useTranslation();
  const params = useParams();
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<OutboundEmailWithDetailsDto>[]>([]);
  const [contactEntity, setContactEntity] = useState<EntityWithDetailsDto>();
  const [selectedEmail, setSelectedEmail] = useState<OutboundEmailWithDetailsDto>();

  useEffect(() => {
    setContactEntity(allEntities.find((e) => e.name === "contact"));
  }, [allEntities]);

  useEffect(() => {
    let headers: RowHeaderDisplayDto<OutboundEmailWithDetailsDto>[] = [
      {
        name: "email",
        title: t("emails.to"),
        value: (i) => (
          <div className="flex flex-col">
            <div>
              {i.contactRow && contactEntity ? (
                <div>{RowHelper.getTextDescription({ entity: contactEntity, item: i.contactRow, t })}</div>
              ) : (
                <div className="text-muted-foreground text-xs italic">
                  <div>{i.email}</div>
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        name: "sentAt",
        title: t("emails.sentAt"),
        value: (i) => (
          <div className="flex justify-center">{i.sentAt ? <OutboundEmailDateFormat date={i.sentAt} /> : <XIcon className="h-4 w-4 text-red-500" />}</div>
        ),
      },
      {
        name: "delivered",
        title: t("emails.delivered"),
        value: (i) => (
          <div className="flex justify-center">
            {i.deliveredAt ? <CheckIcon className="h-4 w-4 text-teal-500" /> : <XIcon className="h-4 w-4 text-red-500" />}
          </div>
        ),
      },
      {
        name: "activity",
        title: t("emailMarketing.activity"),
        value: (i) => (
          <div className="flex flex-col justify-start space-y-1 text-left">
            <button
              type="button"
              disabled={i.opens.length === 0}
              onClick={() => setSelectedEmail(i)}
              className={clsx(
                i.opens.length === 0 ? "text-muted-foreground cursor-not-allowed text-left" : "text-blue-600 underline",
                "text-muted-foreground lowercase"
              )}
            >
              {i.opens.length} {t("emails.opens")}
            </button>
            <button
              type="button"
              disabled={i.clicks.length === 0}
              onClick={() => setSelectedEmail(i)}
              className={clsx(
                i.clicks.length === 0 ? "text-muted-foreground cursor-not-allowed text-left" : "text-blue-600 underline",
                "text-muted-foreground lowercase"
              )}
            >
              {i.clicks.length} {t("emails.clicks")}
            </button>
          </div>
        ),
      },
      {
        name: "error",
        title: t("shared.error"),
        value: (i) => <div className="text-red-500">{i.error}</div>,
      },
      {
        name: "unsubscribedAt",
        title: t("emails.unsubscribedAt"),
        value: (i) => <OutboundEmailDateFormat date={i.unsubscribedAt} />,
      },
      {
        name: "bouncedAt",
        title: t("emails.bouncedAt"),
        value: (i) => <OutboundEmailDateFormat date={i.bouncedAt} />,
      },
      {
        name: "spamComplainedAt",
        title: t("emails.spamComplainedAt"),
        value: (i) => <OutboundEmailDateFormat date={i.spamComplainedAt} />,
      },
    ];
    if (withCampaign) {
      headers = [
        {
          name: "campaignId",
          title: t("emailMarketing.campaign"),
          value: (item) => (
            <div>
              {item.campaignId ? (
                <Link
                  href={
                    params.tenant
                      ? `/admin/${params.tenant}/email-marketing/campaigns/${item.campaignId}`
                      : `/admin/email-marketing/campaigns/${item.campaignId}`
                  }
                  className="focus:bg-secondary/90 hover:border-border rounded-md border-b border-dashed border-transparent"
                >
                  {item.campaign?.name}
                </Link>
              ) : (
                <div>{item.isPreview ? <SimpleBadge title={t("shared.preview")} color={Colors.GRAY} /> : <div>-</div>}</div>
              )}
            </div>
          ),
        },
        ...headers,
      ];
    }
    setHeaders(headers);
  }, [contactEntity, params.tenant, t, withCampaign]);
  return (
    <div>
      <TableSimple headers={headers} items={items} pagination={pagination} />
      <Modal className="sm:max-w-md" open={!!selectedEmail} setOpen={() => setSelectedEmail(undefined)}>
        <div className="space-y-2">
          <div>
            <h3 className="text-foreground text-lg font-medium leading-6">{t("emails.emailActivity")}</h3>
          </div>
          <div className="border-border overflow-hidden rounded-md border-2 border-dashed">
            <div className="h-64 overflow-y-auto">{selectedEmail && <OutboundEmailActivity email={selectedEmail} />}</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function OutboundEmailDateFormat({ date }: { date: Date | null }) {
  return (
    <>
      {date && (
        <div title={DateUtils.dateYMDHMS(date)} className="flex flex-col">
          <div>{DateUtils.dateYMD(date)}</div>
          <div className="text-xs">{DateUtils.dateAgo(date)}</div>
        </div>
      )}
    </>
  );
}

function OutboundEmailActivity({ email }: { email: OutboundEmailWithDetailsDto }) {
  const [items, setItems] = useState<{ type: "click" | "open"; createdAt: Date; description: string }[]>([]);
  useEffect(() => {
    const items: { type: "click" | "open"; createdAt: Date; description: string }[] = [];
    email.opens.forEach((o) => {
      items.push({
        type: "open",
        createdAt: o.createdAt,
        description: o.firstOpen ? "First open" : "",
      });
    });
    email.clicks.forEach((c) => {
      items.push({
        type: "click",
        createdAt: c.createdAt,
        description: c.link,
      });
    });
    setItems(items.sort((a, b) => (b.createdAt > a.createdAt ? -1 : 1)));
  }, [email]);
  return (
    <TableSimple
      items={items}
      headers={[
        {
          name: "createdAt",
          title: "Date",
          value: (i) => <div className="text-muted-foreground">{DateUtils.dateYMDHMS(i.createdAt)}</div>,
        },
        {
          name: "type",
          title: "Type",
          value: (i) => (i.type === "open" ? "Open" : "Click"),
        },
        {
          name: "description",
          title: "Description",
          value: (i) => i.description,
          className: "w-full",
        },
      ]}
    />
  );
}
