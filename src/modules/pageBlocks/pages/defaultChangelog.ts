import { TFunction } from "i18next";
import { ChangelogItem } from "@/components/changelog/ChangelogIssues";
import { getDefaultSiteTags } from "./defaultSeoMetaTags";

export function defaultChangelog({ t }: { t: TFunction }): ChangelogItem[] {
  const items: ChangelogItem[] = [
    {
      date: "Sep 31th, 2024",
      title: "TheRock v1.4.0 🎉",
      url: "https://therock.com/changelog",
      description: "Your description here",
      videos: [
        {
          title: "TheRock Channel",
          url: "https://www.youtube.com/@therock",
          target: "_blank",
        },
      ],
      closed: [
        {
          title: "Added new feature",
          img: [
            {
              title: "TheRock Cover",
              img: getDefaultSiteTags().image,
            },
          ],
        },
      ],
    },
  ];
  return items;
}
