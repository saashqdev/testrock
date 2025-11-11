"use client";

import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "@/lib/enums/shared/Colors";
import ColorBadge from "@/components/ui/badges/ColorBadge";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import InputSelect from "@/components/ui/input/InputSelect";
import InputText from "@/components/ui/input/InputText";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import ErrorModal from "@/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "@/components/ui/modals/SuccessModal";
import * as CodeGeneratorService from "@/modules/codeGenerator/service/CodeGeneratorService";
import { CodeGeneratorFileDto, CodeGeneratorOptions } from "@/modules/codeGenerator/service/CodeGeneratorService";
import { useRootData } from "@/lib/state/useRootData";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

export default function CodeGeneratorFiles({ entity }: { entity: EntityWithDetailsDto }) {
  const { t } = useTranslation();
  const { debug } = useRootData();
  const router = useRouter();

  const successModal = useRef<RefSuccessModal>(null);
  const errorModal = useRef<RefSuccessModal>(null);
  const confirmModal = useRef<RefConfirmModal>(null);

  const [showEditor] = useState<boolean>(true);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams.toString() || "");

  const [options, setOptions] = useState<CodeGeneratorOptions | null>(null);

  const [files, setFiles] = useState<CodeGeneratorFileDto[]>([]);
  const [moduleDirectoryOptions, setModuleDirectoryOptions] = useState<{ name: string; value: string }[]>([]);
  const [routeDirectoryOptions, setRouteDirectoryOptions] = useState<{ name: string; value: string }[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      const defaultOptions = await getDefaultOptions(entity, newSearchParams.get("type")?.toString());
      setOptions(defaultOptions);
      const moduleDirOpts = await CodeGeneratorService.moduleDirectoryOptions(entity);
      const routeDirOpts = await CodeGeneratorService.routeDirectoryOptions(entity);
      setModuleDirectoryOptions(moduleDirOpts);
      setRouteDirectoryOptions(routeDirOpts);
    };
    loadOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, searchParams]);

  useEffect(() => {
    if (options) {
      const loadFiles = async () => {
        const moduleFiles = await CodeGeneratorService.getModuleFiles(options);
        const routeFiles = await CodeGeneratorService.getRouteFiles(options);
        setFiles([...moduleFiles, ...routeFiles]);
      };
      loadFiles();
    } else {
      setFiles([]);
    }
  }, [options]);

  useEffect(() => {
    const file = newSearchParams.get("file");
    if (!file && files.length > 0) {
      newSearchParams.set("file", files[0].file);
      router.push(`?${newSearchParams.toString()}`);
    }
  }, [files, newSearchParams, setSearchParams]);

  async function getDefaultOptions(entity: EntityWithDetailsDto, type?: string) {
    const moduleDirOptions = await CodeGeneratorService.moduleDirectoryOptions(entity);
    const routeDirOptions = await CodeGeneratorService.routeDirectoryOptions(entity);
    const options: CodeGeneratorOptions = {
      entity,
      type: type ?? "dynamic",
      moduleDirectory: moduleDirOptions[0].value,
      routesDirectory: routeDirOptions[0].value,
      deleteFilesOnFinish: false,
      // generateZip: false,
    };
    return options;
  }

  function getSelectedFileCode() {
    const file = newSearchParams.get("file");
    const selectedFile = files.find((e) => e.file === file);
    if (selectedFile) {
      return selectedFile.content;
    }
    return "";
  }

  function onGenerate() {
    confirmModal.current?.show(
      "Generate Files",
      t("shared.download"),
      t("shared.cancel"),
      "Make sure to commit your changes before generating files. This way you can revert the changes if something goes wrong."
    );
  }
  async function onGenerateConfirmed() {
    const response = await fetch("/api/code-generator/" + entity.name, {
      method: "post",
      body: JSON.stringify(options),
    });
    if (response.ok) {
      successModal.current?.show("Generate Files", "Files generated successfully. You can try the module at: " + getSelectedRoute());
    } else {
      errorModal.current?.show(t("shared.error"), await response.text());
    }
  }
  function getSelectedRoute() {
    if (options?.routesDirectory.includes("/app.$tenant")) {
      return "/app";
    } else {
      return options?.routesDirectory.replace("./app/routes", "") ?? "";
    }
  }
  function onTry() {
    if (options?.routesDirectory.includes("/app/$tenant")) {
      router.push(getSelectedRoute());
    } else {
      router.push(getSelectedRoute());
    }
  }
  function filteredItems() {
    return files.filter(
      (e) =>
        e.file.toLowerCase().includes(searchInput.toLowerCase()) ||
        // e.content.toLowerCase().includes(searchInput.toLowerCase()) ||
        e.type.toLowerCase().includes(searchInput.toLowerCase())
    );
  }
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between space-x-2">
        <div className="text-foreground text-lg font-bold">Code Generator</div>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <InputSelect
              className="col-span-3"
              title="Type"
              value={options?.type}
              onChange={(e) => {
                if (options) {
                  setOptions({ ...options, type: e?.toString() ?? "" } as CodeGeneratorOptions);
                }
                newSearchParams.set("type", e?.toString() ?? "");
                newSearchParams.delete("file");
                router.push(`?${newSearchParams.toString()}`);
              }}
              options={[
                { name: "Dynamic", value: "dynamic" },
                { name: "Custom Model", value: "custom", disabled: true },
              ]}
            />
          </div>
          <div>
            <InputSelect
              title="Module Directory"
              value={options?.moduleDirectory}
              onChange={(e) => {
                if (options) {
                  setOptions({ ...options, moduleDirectory: e?.toString() ?? "" } as CodeGeneratorOptions);
                }
              }}
              options={moduleDirectoryOptions}
            />
          </div>
          <div>
            <InputSelect
              title="Routes Directory"
              value={options?.routesDirectory}
              onChange={(e) => {
                if (options) {
                  setOptions({ ...options, routesDirectory: e?.toString() ?? "" } as CodeGeneratorOptions);
                }
              }}
              options={routeDirectoryOptions}
            />
          </div>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 flex justify-between space-x-2 truncate text-xs font-medium">Files</label>
          <div className="border-border bg-background my-1 h-[calc(100vh-270px)] overflow-hidden rounded-md border p-2">
            <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
              <div className="md:w-5/12">
                <div className="hidden space-y-2 overflow-y-auto p-1 md:block">
                  <InputText placeholder={`Search in ${files.length} files...`} value={searchInput} setValue={(e) => setSearchInput(e.toString() ?? "")} />
                  <ul className="bg-background border-border divide-border h-[calc(100vh-325px)] divide-y overflow-y-scroll rounded-md border">
                    {filteredItems().map((file, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => {
                            newSearchParams.set("file", file.file);
                            router.push(`?${newSearchParams.toString()}`);
                          }}
                          className={clsx(
                            "w-full  cursor-pointer truncate rounded-sm border-2 border-dashed p-2 text-left text-sm",
                            newSearchParams.get("file") === file.file
                              ? "border-border text-foreground bg-secondary/90 "
                              : "hover:bg-secondary/90 text-foreground/80 border-transparent"
                          )}
                        >
                          <div className="flex items-center justify-between space-x-3">
                            <div className="flex flex-col">
                              <div className="truncate">
                                {file.file} <span className="text-muted-foreground text-xs">({file.content.split("\n").length} lines)</span>
                              </div>
                              {file.directory && <span className="text-muted-foreground text-xs font-medium">{file.directory}/</span>}
                            </div>

                            <div>
                              <ColorBadge color={file.type === "module" ? Colors.BLUE : file.type === "route" ? Colors.RED : Colors.VIOLET} />
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <InputSelect
                  className="md:hidden"
                  options={files.map((file, idx) => {
                    return { name: file.file, value: idx };
                  })}
                  title="Test"
                  value="test"
                  onChange={(i) => {
                    newSearchParams.set("file", files[i as number].file);
                    router.push(`?${newSearchParams.toString()}`);
                  }}
                />
              </div>
              {showEditor && (
                <div className="overflow-y-auto md:w-7/12">
                  <div>
                    <InputText
                      editor="monaco"
                      editorLanguage="typescript"
                      withLabel={false}
                      value={getSelectedFileCode()}
                      setValue={() => {}}
                      editorSize="screen"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-1">
          <ButtonSecondary disabled={!debug} onClick={onTry}>
            {t("shared.try")}
          </ButtonSecondary>
          <ButtonPrimary disabled={!debug} onClick={onGenerate}>
            {t("shared.generate")}
          </ButtonPrimary>
        </div>

        <ConfirmModal ref={confirmModal} onYes={onGenerateConfirmed} />
        <SuccessModal ref={successModal} />
        <ErrorModal ref={errorModal} />
      </div>
    </div>
  );
}
