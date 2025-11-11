"use client";

import { Metadata } from "next";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import TableSimple from "@/components/ui/tables/TableSimple";
import { getServerTranslations } from "@/i18n/server";
import DateCell from "@/components/ui/dates/DateCell";
import { FormEvent, useEffect, useState, Fragment } from "react";
import Modal from "@/components/ui/modals/Modal";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import { FormulaComponentDto, FormulaDto } from "@/modules/formulas/dtos/FormulaDto";
import FormulaService from "@/modules/formulas/services/server/FormulaService";
import { FormulaVariableValueDto } from "@/modules/formulas/dtos/FormulaVariableValueDto";
import FormulaHelpers from "@/modules/formulas/utils/FormulaHelpers";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import InputText from "@/components/ui/input/InputText";
import { getUserInfo } from "@/lib/services/session.server";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import FormulaComponentBadge from "@/modules/formulas/components/FormulaComponentBadge";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import XIcon from "@/components/ui/icons/XIcon";
import FormulaDefaultService from "@/modules/formulas/services/server/FormulaDefaultService";
import SuccessBanner from "@/components/ui/banners/SuccessBanner";
import ExperimentIconFilled from "@/components/ui/icons/tests/ExperimentIconFilled";
import { defaultFormulas } from "@/modules/formulas/utils/DefaultFormulas";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  title: string;
  items: FormulaDto[];
  allEntities: EntityWithDetailsDto[];
  logs: { formulaId: string; count: number }[];
};
export const loader = async (props: IServerComponentsProps) => {
  const request = props.request!;
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.formulas.view");
  const tenantId = await getTenantIdOrNull({ request, params });
  const items = await db.formulas.getAllFormulas();
  const logs = await db.formulaLogs.countLogs(items.map((item) => item.id ?? ""));
  const allEntities = await db.entities.getAllEntities(null);
  const data: LoaderData = {
    title: `Formulas | ${process.env.APP_NAME}`,
    items: items.map((item) => FormulaHelpers.getFormulaDto(item)),
    logs,
    allEntities,
  };
  return data;
};

type ActionData = {
  success?: string;
  error?: string;
};
export const action = async (props: IServerComponentsProps) => {
  const request = props.request!;
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.entities.update");
  const { t } = await getServerTranslations();
  const userInfo = await getUserInfo();
  const tenantId = await getTenantIdOrNull({ request, params });
  const form = await request.formData();
  const action = form.get("action")?.toString();
  const allEntities = await db.entities.getAllEntities(null);

  if (action === "calculate") {
    const id = form.get("id")?.toString() ?? "";

    const formula = await db.formulas.getFormula(id);
    if (!formula) {
      return Response.json({ error: t("shared.notFound") }, { status: 400 });
    }

    const variables: FormulaVariableValueDto[] = form.getAll("variables[]").map((variable) => JSON.parse(variable.toString()));
    try {
      const result = await FormulaService.calculate({
        formula,
        variables,
        allEntities,
        session: {
          userId: userInfo.userId,
          tenantId,
        },
        originalTrigger: "",
        triggeredBy: "TEST",
        t,
      });
      return Response.json({ success: result });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else if (action === "createDefault") {
    await verifyUserHasPermission("admin.formulas.create");
    const name = form.get("name")?.toString();
    const createdDefault = await FormulaDefaultService.createDefault(name);
    return Response.json({ createdDefault });
  } else {
    return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

export default function FormulasPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();

  // Replace useLoaderData with useState
  const [data, setData] = useState<LoaderData>({
    title: `Formulas | ${process.env.NEXT_PUBLIC_APP_NAME || 'App'}`,
    items: [],
    allEntities: [],
    logs: [],
  });

  // Replace useActionData with useState
  const [actionData, setActionData] = useState<ActionData>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executingFormula, setExecutingFormula] = useState<FormulaDto | undefined>(undefined);
  const [showSlideOver, setShowSlideOver] = useState(false);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/admin/formulas');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error loading formulas:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/admin/formulas');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Error loading formulas:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setActionData({});
    
    try {
      const response = await fetch('/api/admin/formulas', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setActionData(result);
        // Reload data after successful action
        const reloadResponse = await fetch('/api/admin/formulas');
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json();
          setData(reloadData);
        }
      } else {
        setActionData({ error: result.error || 'An error occurred' });
      }
    } catch (error) {
      setActionData({ error: 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  }

  function onExecute(item: FormulaDto, variables: FormulaVariableValueDto[]) {
    setExecutingFormula(undefined);

    const form = new FormData();
    form.set("action", "calculate");
    form.set("id", item.id?.toString() ?? "");
    variables.forEach((variable) => {
      form.append("variables[]", JSON.stringify(variable));
    });

    handleSubmit(form);
  }

  function onCreateDefault(name: string) {
    const form = new FormData();
    form.set("action", "createDefault");
    form.set("name", name);
    handleSubmit(form);
  }

  function missingDefaults() {
    const items = defaultFormulas();
    const missing: FormulaDto[] = [];
    items.forEach((item) => {
      if (data.items.some((formula) => formula.name === item.name)) {
        return;
      }
      missing.push(item);
    });

    let hasOneNotInDefault = data.items.some((item) => !items.some((formula) => formula.name === item.name));
    return hasOneNotInDefault ? [] : missing;
  }

  function getLogsCount(item: FormulaDto) {
    return data.logs.find((log) => log.formulaId === item.id)?.count ?? 0;
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3 px-4 py-2 pb-6 sm:px-6 sm:pt-3 lg:px-8 xl:max-w-full">
      <div className="">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-medium leading-6">Formulas</h3>
          <div className="flex items-center space-x-2">
            <ButtonSecondary to="logs">
              <span>Logs</span>
            </ButtonSecondary>
            <ButtonPrimary to="new">
              <span>{t("shared.new")}</span>
            </ButtonPrimary>
          </div>
        </div>
      </div>

      {missingDefaults().length > 0 && (
        <InfoBanner title="Sample Formulas">
          <div className="flex flex-wrap">
            {missingDefaults().map((item) => {
              return (
                <ButtonSecondary
                  className="m-0.5"
                  key={item.name}
                  disabled={isSubmitting}
                  onClick={() => onCreateDefault(item.name)}
                >
                  {isSubmitting ? (
                    <span>Creating...</span>
                  ) : (
                    <span>{item.name}</span>
                  )}
                </ButtonSecondary>
              );
            })}
          </div>
        </InfoBanner>
      )}

      {actionData?.success !== undefined ? (
        <SuccessBanner>
          <span className="font-bold">Result:</span> {actionData.success}
        </SuccessBanner>
      ) : (
        actionData?.error !== undefined && <ErrorBanner title="Error">{actionData.error}</ErrorBanner>
      )}

      <TableSimple
        items={data.items}
        actions={[
          {
            title: t("shared.edit"),
            onClickRoute: (_, i) => `${i.id}`,
          },
        ]}
        headers={[
          {
            name: "actions",
            title: "",
            value: (i) => {
              return (
                <div>
                  <LoadingButton
                    isLoading={isSubmitting}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setExecutingFormula(i)}
                  >
                    <ExperimentIconFilled className="h-3 w-3" />
                  </LoadingButton>
                </div>
              );
            },
          },
          {
            name: "formula",
            title: "Formula",
            value: (i) => (
              <div className="flex max-w-xs flex-col truncate">
                <div className="truncate text-base font-bold">
                  {i.name} <span className="text-muted-foreground text-sm font-normal">({i.resultAs})</span>
                </div>
                <div className="text-muted-foreground truncate text-sm">{i.description}</div>
              </div>
            ),
          },
          {
            name: "calculationTrigger",
            title: "Trigger",
            value: (i) => i.calculationTrigger,
          },
          {
            name: "components",
            title: "Components",
            value: (i) => (
              <div className="flex flex-wrap">
                {i.components.map((item, idx) => {
                  return (
                    <span key={idx} className="m-0.5">
                      <FormulaComponentBadge item={item} />
                    </span>
                  );
                })}
              </div>
            ),
            className: "w-full",
          },
          {
            name: "withLogs",
            title: "Logging",
            value: (i) => <div>{i.withLogs ? <CheckIcon className="h-4 w-4 text-green-500" /> : <XIcon className="text-muted-foreground h-4 w-4" />}</div>,
          },
          {
            name: "calculations",
            title: "Calculations",
            value: (i) => (
              <Link href={`/admin/entities/formulas/logs?formulaId=${i.id}`} className="text-muted-foreground text-sm hover:text-blue-700 hover:underline">
                {getLogsCount(i)} calculations
              </Link>
            ),
          },
          {
            name: "inProperties",
            title: "In Properties",
            value: (i) => <div className="text-muted-foreground text-sm">{i.inProperties?.map((f) => `${f.entity.name}.${f.name}`).join(", ")}</div>,
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (i) => <DateCell date={i.createdAt ?? null} />,
            className: "hidden 2xl:table-cell",
          },
        ]}
        noRecords={
          <div className="p-12 text-center">
            <h3 className="text-foreground mt-1 text-sm font-medium">No formulas yet</h3>
            <p className="text-muted-foreground mt-1 text-sm">Get started by creating a new formula</p>
          </div>
        }
      />

      <ExecuteModal
        item={executingFormula}
        open={executingFormula !== undefined}
        onClose={() => setExecutingFormula(undefined)}
        onCreate={({ item, variables }) => onExecute(item, variables)}
        allEntities={data.allEntities}
      />

      <SlideOverWideEmpty
        title={"Formula"}
        description={params.id ? "Edit formula" : "Create formula"}
        open={showSlideOver}
        onClose={() => {
          setShowSlideOver(false);
          router.push("/admin/entities/formulas");
        }}
        className="sm:max-w-2xl"
        overflowYScroll={true}
      >
        {<></>}
      </SlideOverWideEmpty>
    </div>
  );
}

function ExecuteModal({
  item,
  open,
  onClose,
  onCreate,
  allEntities,
}: {
  item?: FormulaDto;
  open: boolean;
  onClose: () => void;
  onCreate: ({ item, variables }: { item: FormulaDto; variables: FormulaVariableValueDto[] }) => void;
  allEntities: EntityWithDetailsDto[];
}) {
  const { t } = useTranslation();
  const [formula, setFormula] = useState<FormulaDto | undefined>(item);
  const [variablesValues, setVariablesValues] = useState<FormulaVariableValueDto[]>([]);

  const [result] = useState<string>();
  const [resultState] = useState<"error" | "success">();

  useEffect(() => {
    setFormula(item);
    setVariablesValues([]);
  }, [formula, item]);

  useEffect(() => {
    if (formula) {
      // FormulaService.calculate({
      //   allEntities,
      //   formula: formula as FormulaWithDetails,
      //   variables: variablesValues,
      //   session: { userId: undefined, tenantId: null },
      //   originalTrigger: "",
      //   triggeredBy: "",
      //   isDebugging: true,
      //   t,
      // })
      //   .then((r) => {
      //     setResultState("success");
      //     setResult(r?.toString() ?? "null");
      //   })
      //   .catch((e) => {
      //     setResultState("error");
      //     setResult(e.message);
      //   });
    }
  }, [allEntities, formula, variablesValues, t]);

  function onChangeVariableValue(component: FormulaComponentDto, value: string) {
    if (component.type === "variable") {
      const newValues = variablesValues.filter((v) => v.plain?.variable !== component.value);
      newValues.push({ plain: { variable: component.value ?? "", textValue: value } });
      setVariablesValues(newValues);
    }
  }
  function getValue(variable: FormulaComponentDto) {
    if (variable.type === "variable") {
      return variablesValues.find((v) => v.plain?.variable === variable.value)?.plain?.textValue ?? "";
    }
  }
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.stopPropagation();
    e.preventDefault();
    onCreate({ item: formula!, variables: variablesValues });
  }
  return (
    <Modal open={open} setOpen={onClose} size="md">
      <form onSubmit={handleSubmit} className="bg-background inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <div className="mt-3 sm:mt-5">
          <div className="flex items-baseline justify-between space-x-2">
            <h3 className="text-foreground text-lg font-medium leading-6">Test formula</h3>
            <div className="text-muted-foreground text-sm font-bold italic">{formula?.resultAs}</div>
          </div>
        </div>
        {!formula ? (
          <></>
        ) : (
          <>
            <div className="mt-4 space-y-2">
              <div className="border-border bg-secondary grid max-h-72 grid-cols-12 gap-1 overflow-x-auto rounded-md border border-dashed p-2 pb-4">
                {formula.components.map((v, idx) => {
                  return (
                    <Fragment key={idx}>
                      {v.type === "variable" ? (
                        <InputText
                          className="col-span-12"
                          placeholder={v.value ?? ""}
                          name={v.value ?? ""}
                          readOnly={!v.value}
                          value={getValue(v)}
                          setValue={(e) => onChangeVariableValue(v, e.toString())}
                        />
                      ) : v.type === "operator" ? (
                        <InputText
                          className="col-span-12"
                          name={v.value}
                          disabled={true}
                          defaultValue={
                            `${FormulaHelpers.getOperatorSymbol(v.value)}`
                            // `${v.operator} (${FormulaHelpers.getOperatorSymbol(v.operator)})`
                          }
                        />
                      ) : v.type == "parenthesis" ? (
                        <InputText className="col-span-12" readOnly={true} defaultValue={v.value} />
                      ) : v.type === "value" ? (
                        <InputText className="col-span-12" readOnly={true} defaultValue={v.value} />
                      ) : null}
                    </Fragment>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 w-full sm:mt-6">
              <InputText
                name="result"
                title="Result"
                placeholder="Waiting for variables..."
                readOnly={true}
                defaultValue={result}
                isError={resultState === "error"}
                isSuccess={resultState === "success"}
              />
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
