"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import XIcon from "@/components/ui/icons/XIcon";
import InputText from "@/components/ui/input/InputText";
import { defaultSeoMetaTags } from "@/modules/pageBlocks/utils/defaultSeoMetaTags";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { LoaderData } from "../../routes/pages/PageMetaTags_Index";
import toast from "react-hot-toast";
import Image from "next/image";

interface Props {
  data: LoaderData;
}

export default function PageMetaTagsRoute_Index({ data }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const appOrAdminData = useAppOrAdminData();

  const [metaTags, setMetaTags] = useState<{ name: string; content: string; order: number }[]>(data.metaTags);
  const [canUpdate] = useState(getUserHasPermission(appOrAdminData, "admin.pages.update"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission with Next.js patterns
  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(window.location.pathname + '/api', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        toast.error(result.error || 'An error occurred');
        return;
      }
      
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.success);
      }
      
      if (result.metaTags) {
        setMetaTags(result.metaTags);
      }
      
      // Refresh the page data
      startTransition(() => {
        router.refresh();
      });
      
    } catch (error) {
      toast.error('An error occurred while saving');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  function addTag() {
    setMetaTags([...metaTags, { name: "", content: "", order: metaTags.length + 1 }]);
  }
  function removeTag(index: number) {
    // const newMetaTags = { ...metaTags };
    // delete newMetaTags[index];
    // setMetaTags(newMetaTags);
    setMetaTags(metaTags.filter((_, idx) => idx !== index));
  }
  // function updateTagName(index: number, name: string) {
  //   const newMetaTags = { ...metaTags };
  //   delete newMetaTags[index];
  //   newMetaTags[name] = metaTags[index];
  //   setMetaTags(newMetaTags);
  // }
  // function updateTagValue(index: number, value: string) {
  //   const newMetaTags = { ...metaTags };
  //   Object.keys(metaTags).forEach((tag, idx) => {
  //     if (idx === index) {
  //       newMetaTags[tag] = value;
  //     }
  //   });
  //   setMetaTags(newMetaTags);
  // }

  function onReset() {
    const form = new FormData();
    form.set("action", "reset");
    handleSubmit(form);
  }
  function duplicatedTags() {
    const tags = metaTags.map((tag) => tag.name);
    return tags.filter((tag, index) => tags.indexOf(tag) !== index);
  }
  function onSetDefaultMetaTags() {
    const tags = defaultSeoMetaTags({ t });

    const newMetaTags = tags.map((tag, index) => {
      return {
        // @ts-ignore
        name: tag.name ?? "",
        // @ts-ignore
        content: tag.content ?? "",
        order: index + 1,
      };
    });
    setMetaTags(newMetaTags);
  }
  return (
    <div className="space-y-3">
      {Object.keys(metaTags).length > 0 || Object.values(metaTags).length > 0 ? (
        <InfoBanner title="Default Configuration" text="Customize the default Meta tags at: app/pages/defaultSeoMetaTags.ts." />
      ) : (
        <button
          type="button"
          onClick={onSetDefaultMetaTags}
          className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border p-12 text-center hover:border-border focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <div className="text-sm font-medium">Load Default Meta Tags</div>
        </button>
      )}

      <form 
        className="divide-y-gray-200 space-y-2 divide-y"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          formData.set("action", "update");
          
          // Add all meta tags to form data
          metaTags
            .sort((a, b) => a.order - b.order)
            .forEach((tag) => {
              formData.append("metaTags[]", JSON.stringify({
                name: tag.name,
                content: tag.content,
                order: tag.order,
              }));
            });
            
          handleSubmit(formData);
        }}
      >
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
          <div className="space-y-3 sm:col-span-6">
            <div className="flex flex-col space-y-2">
              {metaTags
                .sort((a, b) => a.order - b.order)
                .map((_, index) => {
                  return (
                    <div key={index} className="group relative grid grid-cols-4 gap-2">
                      <button
                        onClick={() => removeTag(index)}
                        type="button"
                        className="absolute right-0 top-0 hidden origin-top-right justify-center rounded-full bg-background text-muted-foreground hover:text-red-500 group-hover:flex"
                      >
                        <XIcon className="h-4 w-4 text-red-500" />
                      </button>
                      <InputText
                        required
                        className="col-span-1"
                        title="Name"
                        value={metaTags[index].name}
                        disabled={!canUpdate}
                        setValue={(e) => {
                          const newMetaTags = [...metaTags];
                          newMetaTags[index].name = e.toString();
                          setMetaTags(newMetaTags);
                        }}
                      />
                      <InputText
                        required
                        className="col-span-3"
                        title="Value"
                        value={metaTags[index].content}
                        disabled={!canUpdate}
                        setValue={(e) => {
                          const newMetaTags = [...metaTags];
                          newMetaTags[index].content = e.toString();
                          setMetaTags(newMetaTags);
                        }}
                      />
                      {["og:image", "twitter:image"].includes(metaTags[index].name) && (
                        <div className="col-span-4 overflow-hidden rounded-lg border-2 border-dashed border-border bg-secondary p-3">
                          <Image className="mx-auto h-64 rounded-md object-cover shadow-xl" src={metaTags[index].content} alt={metaTags[index].name} />
                        </div>
                      )}
                    </div>
                  );
                })}
              <ButtonTertiary onClick={() => addTag()} disabled={!canUpdate}>
                Add custom tag
              </ButtonTertiary>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {duplicatedTags().length > 0 && <WarningBanner title="Duplicated Tags" text={`There are duplicated tags: ${duplicatedTags().join(", ")}`} />}
          <div className="flex justify-between pt-4">
            <ButtonTertiary destructive onClick={onReset} disabled={isSubmitting}>
              Reset
            </ButtonTertiary>
            <LoadingButton 
              type="submit" 
              disabled={!getUserHasPermission(appOrAdminData, "admin.pages.update") || duplicatedTags().length > 0 || isSubmitting}
              isLoading={isSubmitting}
            >
              {t("shared.save")}
            </LoadingButton>
          </div>
        </div>
      </form>
    </div>
  );
}
