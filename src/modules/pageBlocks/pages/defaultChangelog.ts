import { TFunction } from "i18next";
import { ChangelogItem } from "@/components/changelog/ChangelogIssues";
import { getDefaultSiteTags } from "./defaultSeoMetaTags";

export function defaultChangelog({ t }: { t: TFunction }): ChangelogItem[] {
  const items: ChangelogItem[] = [
    {
      date: "Nov 25th, 2025",
      title: "NextRock v1.6.1 🎉",
      url: "https://nextrock.com/changelog",
      description: "Your description here",
      videos: [
        {
          title: "NextRock Channel",
          url: "https://www.youtube.com/@NextRock",
          target: "_blank",
        },
      ],
      closed: [
        {
          title: "Added new feature",
          img: [
            {
              title: "NextRock Cover",
              img: getDefaultSiteTags().image,
            },
          ],
        },
      ],
    },
  ];
  return items;
}
