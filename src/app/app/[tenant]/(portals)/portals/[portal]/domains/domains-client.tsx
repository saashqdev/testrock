"use client";

import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import Link from "next/link";
import clsx from "clsx";
import { Fragment } from "react";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputText from "@/components/ui/input/InputText";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import SettingSection from "@/components/ui/sections/SettingSection";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import ColorBadge from "@/components/ui/badges/ColorBadge";
import { Colors } from "@/lib/enums/shared/Colors";
import SuccessBanner from "@/components/ui/banners/SuccessBanner";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import ClipboardIcon from "@/components/ui/icons/ClipboardIcon";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import { GetCertDto } from "@/modules/domains/dtos/GetCertDto";
import UrlUtils from "@/utils/app/UrlUtils";

type DomainsClientProps = {
  data: {
    item: PortalWithDetailsDto;
    certificate: GetCertDto | null;
    portalUrl: string;
  };
  params: any;
  editDomain: (formData: FormData) => Promise<{ success?: string; error?: string }>;
  checkDomain: () => Promise<{ success?: string; error?: string }>;
  deleteDomain: () => Promise<{ success?: string; error?: string }>;
};

export default function DomainsClient({ data, params, editDomain, checkDomain, deleteDomain }: DomainsClientProps) {
  const { t } = useTranslation();
  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete() {
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  async function onDeleteConfirm() {
    const result = await deleteDomain();
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }
  }

  async function onCheck() {
    const result = await checkDomain();
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await editDomain(formData);
    if (result.success) {
      toast.success(result.success);
    } else if (result.error) {
      toast.error(result.error);
    }
  }

  return (
    <EditPageLayout
      title={"Domain"}
      withHome={false}
      menu={[
        {
          title: data.item.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}`),
        },
        {
          title: "Domain",
        },
      ]}
    >
      <SettingSection title={t("models.domain.custom")} size="lg">
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="action" value="edit" readOnly hidden />
          <div className="space-y-2">
            <InputText
              name="domain"
              title={"Domain"}
              defaultValue={data.item.domain ?? ""}
              disabled={!!data.item.domain}
              placeholder="example.com"
              hint={
                <div>
                  {data.portalUrl && data.item.domain && (
                    <Link href={data.item.domain} target="_blank" className="underline">
                      {data.item.domain}
                    </Link>
                  )}
                </div>
              }
            />
            <div className="mt-3 border-t border-border pt-3">
              <div className="flex justify-end">
                <div>
                  {!data.item.domain && <LoadingButton type="submit">{t("shared.save")}</LoadingButton>}
                  {data.item.domain && (
                    <ButtonPrimary onClick={onDelete} destructive>
                      {t("shared.remove")}
                    </ButtonPrimary>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </SettingSection>

      {data.certificate?.records && (
        <Fragment>
          {/*Separator */}
          <div className="block">
            <div className="py-5">
              <div className="border-t border-border"></div>
            </div>
          </div>

          <SettingSection
            title={
              <div className="flex items-center space-x-2 truncate">
                <ColorBadge color={data.certificate.configured ? Colors.GREEN : Colors.YELLOW} />
                <div className="truncate">{t("models.domain.verification.title")}</div>
              </div>
            }
            size="lg"
          >
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">{t("models.domain.verification.description")}</div>
              {data.certificate.records.A && (
                <div className="flex items-center space-x-2">
                  <div className="w-1/2">
                    <RecordInput title={t("models.domain.recordName")} type="A" value={data.certificate.records.A.name} />
                  </div>
                  <div className="px-2 pt-5 font-medium">&rarr;</div>
                  <div className="w-1/2">
                    <RecordInput title={t("models.domain.recordValue")} value={data.certificate.records.A.value} />
                  </div>
                </div>
              )}
              {data.certificate.records.AAAA && (
                <div className="flex items-center space-x-2">
                  <div className="w-1/2">
                    <RecordInput title={t("models.domain.recordName")} type="AAAA" value={data.certificate.records.AAAA.name} />
                  </div>
                  <div className="px-2 pt-5 font-medium">&rarr;</div>
                  <div className="w-1/2">
                    <RecordInput title={t("models.domain.recordValue")} value={data.certificate.records.AAAA.value} />
                  </div>
                </div>
              )}
              {data.certificate.records.CNAME && (
                <div className="flex items-center space-x-2">
                  <div className="w-1/2">
                    <RecordInput title={t("models.domain.recordName")} type="CNAME" value={data.certificate.records.CNAME.name} />
                  </div>
                  <div className="px-2 pt-5 font-medium">&rarr;</div>
                  <div className="w-1/2">
                    <RecordInput title={t("models.domain.recordValue")} value={data.certificate.records.CNAME.value} />
                  </div>
                </div>
              )}

              {!data.certificate.configured ? (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  <WarningBanner title={t("models.domain.notVerified.title")}>
                    <ButtonSecondary onClick={onCheck}>{t("models.domain.notVerified.description")}</ButtonSecondary>
                  </WarningBanner>
                  <div className="flex justify-end">
                    <ButtonSecondary onClick={onCheck}>{t("models.domain.notVerified.cta")}</ButtonSecondary>
                  </div>
                </div>
              ) : (
                <SuccessBanner title={t("models.domain.verified.title")}>
                  <div>{t("models.domain.verified.description")}</div>
                  <Link href={data.portalUrl} target="_blank" className="underline">
                    {t("models.domain.verified.cta")}
                  </Link>
                </SuccessBanner>
              )}
            </div>
          </SettingSection>
        </Fragment>
      )}

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
    </EditPageLayout>
  );
}

function RecordInput({ title, type, value }: { title: string; type?: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-foreground">{title}</label>
      <div className="mt-1 flex overflow-hidden rounded-md border border-border">
        <div className="relative flex grow items-stretch focus-within:z-10">
          {type && (
            <div className="absolute inset-y-0 left-0 flex w-16 items-center justify-center border-r bg-secondary/90 pl-3 pr-4 text-xs font-medium text-muted-foreground">
              {type}
            </div>
          )}
          <input
            className={clsx("focus:outline-hidden block w-full rounded-none rounded-l-md border-0 py-2 text-xs text-foreground", type && "pl-20")}
            value={value}
            readOnly
          />
        </div>
        <button
          type="button"
          className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md border-l border-border bg-background px-3 py-2 text-sm font-semibold text-foreground"
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard");
          }}
        >
          <ClipboardIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
