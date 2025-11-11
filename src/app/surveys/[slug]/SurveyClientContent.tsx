"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ImageOrSvg from "@/components/images/ImageOrSvg";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import Modal from "@/components/ui/modals/Modal";
import { NewsletterForm } from "@/modules/pageBlocks/components/blocks/marketing/newsletter/NewsletterVariantSimple";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import clsx from "clsx";
import { BarChart } from "@tremor/react";
import ExternalLinkEmptyIcon from "@/components/ui/icons/ExternalLinkEmptyIcon";
import { SurveyDto, SurveyItemResultDto, SurveyItemDto } from "@/modules/surveys/dtos/SurveyDtos";
import { useRootData } from "@/lib/state/useRootData";
import BreadcrumbSimple from "@/components/ui/breadcrumbs/BreadcrumbSimple";

type LoaderData = {
  item: SurveyDto;
  alreadyVoted: boolean;
  canShowResults: boolean;
};

export function SurveyClientContent({ data }: { data: LoaderData }) {
  const { t } = useTranslation();
  const rootData = useRootData();
  const searchParams = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
  const showingResults = newSearchParams.get("results") !== null || newSearchParams.get("success") !== null;

  return (
    <div className={clsx("container mx-auto space-y-4 px-4 sm:px-6 lg:px-8", data.item.results ? "" : "")}>
      <div className={clsx("mx-auto space-y-6", data.item.results ? "max-w-4xl" : "max-w-4xl")}>
        <div className="space-y-3">
          <div className="text-left">
            <BreadcrumbSimple
              menu={[
                { title: t("surveys.title"), routePath: "/surveys" },
                { title: data.item.title, routePath: `/surveys/${data.item.slug}` },
              ]}
            />
            <div className="flex flex-col items-center justify-between space-y-2 md:flex-row md:space-x-2 md:space-y-0">
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight  sm:text-4xl">
                {t("surveys.object")}: {data.item.title}
              </h1>
              {rootData.user?.admin && (
                <div className="flex justify-center">
                  <ButtonPrimary to={`/admin/help-desk/surveys/${data.item.id}/edit`}>{t("shared.edit")}</ButtonPrimary>
                </div>
              )}
            </div>
            <p className="text-muted-foreground mt-2 text-base">{data.item.description}</p>
          </div>
        </div>
      </div>
      <div className={clsx("mx-auto space-y-6", data.item.results ? "max-w-4xl" : "max-w-4xl")}>
        {!data.alreadyVoted && data.item.minSubmissions > 0 && showingResults && (
          <WarningBanner title="You haven't voted yet" text="Please vote to see the results." />
        )}
        <SurveyGroup
          survey={data.item}
          disabled={!data.item.isEnabled || !!data.item.results || data.alreadyVoted}
          alreadyVoted={data.alreadyVoted}
          canShowResults={data.canShowResults}
          showingResults={showingResults}
        />
      </div>
    </div>
  );
}

function SurveyGroup({
  survey,
  disabled,
  alreadyVoted,
  canShowResults,
  showingResults,
}: {
  survey: SurveyDto;
  disabled: boolean;
  alreadyVoted: boolean;
  canShowResults: boolean;
  showingResults: boolean;
}) {
  const { t } = useTranslation();
  const rootData = useRootData();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState<SurveyItemResultDto[]>(
    survey.items.map((item) => ({
      item: item.title,
      values: rootData.debug ? [item.options[0].title] : [],
    }))
  );

  useEffect(() => {
    setShowModal(newSearchParams.get("success") ? true : false);
  }, [newSearchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("action", "vote");
      formData.append("results", JSON.stringify(results));

      const response = await fetch(`/api/surveys/${survey.slug}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else if (data.redirect) {
        router.push(data.redirect);
      } else {
        setShowModal(true);
        router.push(`?success=true`);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  function canSubmit() {
    const hasAllItemsWithAtLeastOneValue = survey.items.every((item) => {
      const value = results.find((r) => r.item === item.title);
      if (!value) {
        return false;
      }
      if (item.type === "multi-select") {
        return value.values.length > 0;
      }
      return value.values.length === 1;
    });
    return hasAllItemsWithAtLeastOneValue;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={clsx("border-border grid grid-cols-1 gap-6 pt-4")}>
        {survey.items.map((item, idx) => {
          const value = results.find((r) => r.item === item.title) || {
            item: item.title,
            values: [],
          };
          return (
            <SurveyItem
              key={idx}
              survey={survey}
              item={item}
              value={value}
              disabled={disabled}
              onChange={(value) => {
                setResults((prev) => {
                  const idx = prev.findIndex((r) => r.item === value.item);
                  if (idx === -1) {
                    return [...prev, value];
                  }
                  return [...prev.slice(0, idx), value, ...prev.slice(idx + 1)];
                });
              }}
            />
          );
        })}
      </div>

      {!survey.isEnabled ? <WarningBanner title="Disabled" text="Voting is closed for this survey." /> : null}

      <div className="flex justify-end space-x-2">
        {canShowResults && (
          <Fragment>
            {showingResults ? <ButtonSecondary to="?">Hide Results</ButtonSecondary> : <ButtonSecondary to="?results=true">View Results</ButtonSecondary>}
          </Fragment>
        )}
        {(newSearchParams.get("success") !== null || newSearchParams.get("results") !== null) && (
          <ButtonSecondary
            onClick={() => {
              newSearchParams.delete("success");
              newSearchParams.delete("results");
              router.push(`?${newSearchParams.toString()}`);
            }}
          >
            {t("shared.reset")}
          </ButtonSecondary>
        )}
        <LoadingButton isLoading={isLoading} disabled={!canSubmit() || !survey.isEnabled || disabled} type="submit">
          {alreadyVoted ? "You already voted" : <span>{t("shared.submit")}</span>}
        </LoadingButton>
      </div>

      <Modal size="sm" open={showModal} setOpen={() => setShowModal(false)}>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Thanks for your feedback!</h3>
          <p className="text-muted-foreground">Subscribe to TheRock&apos;s newsletter to get product updates and more.</p>
          <NewsletterForm onClose={() => setShowModal(false)} />
        </div>
      </Modal>
    </form>
  );
}

function SurveyItem({
  survey,
  item,
  value,
  onChange,
  disabled,
}: {
  survey: SurveyDto;
  item: SurveyItemDto;
  value: SurveyItemResultDto;
  onChange: (value: SurveyItemResultDto) => void;
  disabled: boolean;
}) {
  const itemResults = survey.results?.items.find((r) => r.item === item.title);
  const mainInput = useRef<HTMLInputElement>(null);

  function focusOtherInput() {
    setTimeout(() => {
      mainInput.current?.focus();
    }, 0);
  }

  const chartData = itemResults ? itemResults.votes.map((vote) => ({ name: vote.option, Votes: vote.count })) : [];

  return (
    <div className="space-y-1">
      <div>
        <div className="flex justify-between space-x-2">
          <div className="flex h-9 items-center">
            <h3 className="line-clamp-1 text-base font-semibold">{item.title}</h3>
            {item.href && (
              <Link href={item.href} target="_blank" className="hover:bg-secondary ml-1 rounded-md p-2">
                <ExternalLinkEmptyIcon className="h-4 w-4" />
              </Link>
            )}
            {item.categories && (
              <div className="ml-2 flex flex-wrap items-center gap-2">
                {item.categories.map((category, idx) => (
                  <span key={idx} className="text-muted-foreground bg-secondary rounded-md px-2 py-1 text-xs">
                    {category}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {item.description && !survey.results && <p className="text-muted-foreground text-sm">{item.description}</p>}
      </div>
      <div className={clsx(item.style === "default" && "bg-background border-border rounded-md border p-5", disabled && " opacity-90")}>
        {itemResults ? (
          <BarChart
            className="h-40"
            data={chartData}
            index="name"
            categories={["Votes"]}
            colors={item.color ? [item.color] : ["blue"]}
            valueFormatter={(number) => Intl.NumberFormat("us").format(number).toString()}
            yAxisWidth={48}
          />
        ) : (
          <div className="flex justify-between space-x-2">
            <div
              className={clsx(
                item.style === "default" && "flex flex-wrap items-center gap-x-3 gap-y-2",
                item.style === "grid" && "grid w-full gap-2 md:grid-cols-2"
              )}
            >
              {item.options.map((option, idx) => (
                <div
                  key={idx}
                  className={clsx("flex flex-wrap items-center gap-3", item.style === "grid" && "bg-background border-border rounded-md border px-5 py-3")}
                >
                  <label key={idx} className={clsx("flex select-none items-center space-x-2", disabled ? " cursor-not-allowed " : "cursor-pointer")}>
                    {item.type === "multi-select" ? (
                      <Checkbox
                        name={item.title}
                        checked={value.values.includes(option.title)}
                        className={clsx(disabled && "opacity-50")}
                        onCheckedChange={(e) => {
                          onChange({
                            ...value,
                            values: e ? [...value.values, option.title] : value.values.filter((v) => v !== option.title),
                          });
                          if (e && option.isOther) {
                            focusOtherInput();
                          }
                        }}
                        disabled={disabled}
                      />
                    ) : item.type === "single-select" ? (
                      <input
                        type="radio"
                        name={item.title}
                        value={option.title}
                        checked={value.values.includes(option.title)}
                        required
                        className={clsx(disabled && "opacity-50")}
                        disabled={disabled}
                        onChange={(e) => {
                          onChange({ ...value, values: [option.title] });
                          if (option.isOther) {
                            focusOtherInput();
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={clsx(
                        "flex h-9 items-center space-x-2 rounded-md px-4",
                        disabled
                          ? ""
                          : value.values.includes(option.title)
                          ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                          : "bg-background text-foreground",
                        disabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      {option.icon && <ImageOrSvg icon={option.icon} className="h-4 w-4" />}
                      <div>{option.title}</div>
                    </div>
                  </label>
                  {option.isOther && value.values.includes(option.title) && (
                    <div className="w-full sm:w-64">
                      <label className="flex items-center space-x-2">
                        <Input
                          ref={mainInput}
                          type="text"
                          value={value.other}
                          onChange={(e) => {
                            onChange({ ...value, other: e.target.value });
                          }}
                          placeholder="Other..."
                          disabled={disabled}
                        />
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
