"use client";

import { Fragment, useEffect, useState } from "react";
import ButtonEvent from "@/components/ui/buttons/ButtonEvent";
import { useRootData } from "@/lib/state/useRootData";
import Image from "next/image";

interface Props {
  theme?: "light" | "neutral" | "dark";
}
export default function ProductHuntBadge({ theme }: Props) {
  const rootData = useRootData();
  const [mounted, setMounted] = useState(false);
  const producthunt = rootData?.appConfiguration?.launches?.producthunt;
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted on client
  if (!mounted || !producthunt) {
    return null;
  }

  return (
    <Fragment>
      {producthunt ? (
        <div className="mx-auto mb-6 flex justify-center text-center">
          <ButtonEvent
            event={{ action: "click", category: "hero", label: "producthunt", value: producthunt.title }}
            to={producthunt.url}
            target="_blank"
            rel="noreferrer"
          >
            {theme === "light" ? (
              <Image
                src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${producthunt.postId}&theme=light`}
                alt={producthunt.title}
                style={{
                  width: "220px",
                }}
                width="250"
                height="54"
              />
            ) : theme === "neutral" ? (
              <Image
                src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${producthunt.postId}&theme=neutral`}
                alt={producthunt.title}
                style={{
                  width: "220px",
                }}
                width="250"
                height="54"
              />
            ) : theme === "dark" ? (
              <Image
                src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${producthunt.postId}&theme=dark`}
                alt={producthunt.title}
                style={{
                  width: "220px",
                }}
                width="250"
                height="54"
              />
            ) : null}
          </ButtonEvent>
        </div>
      ) : null}
    </Fragment>
  );
}