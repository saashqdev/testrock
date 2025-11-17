"use client";

import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DateCell from "@/components/ui/dates/DateCell";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";

type SupabasePlaygroundProps = {
  supabaseConfig: {
    url?: string;
    key?: string;
  };
};

// type ActionData = {
//   success?: string;
//   error?: string;
// };
// export const action = async (props: IServerComponentsProps) => {
//   const form = await request.formData();
//   const action = form.get("action");
//   if (action === "") {
//     return Response.json({success: ""})
//   } else {
//     return Response.json({ error: "Invalid action" }, { status: 400 });
//   }
// };

export default function SupabasePlayground({ supabaseConfig }: SupabasePlaygroundProps) {
  const { t } = useTranslation();

  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient>();
  const [items, setItems] = useState<
    {
      id: string;
      createdAt: Date;
      schema: string;
      table: string;
      commit_timestamp: string;
      errors: string[];
      eventType: string;
      new: string;
      old: string;
    }[]
  >([]);

  useEffect(() => {
    if (supabaseConfig.url && supabaseConfig.key) {
      const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.key);
      // eslint-disable-next-line no-console
      console.log("[Supabase] Init", supabaseClient);
      setSupabaseClient(supabaseClient);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseConfig]);

  useEffect(() => {
    if (supabaseClient) {
      subscribeToChannel({ channel: "public:User", table: "User" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseClient]);

  function subscribeToChannel({ channel, table }: { channel: string; table: string }) {
    supabaseClient
      ?.channel(channel)
      .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
        const newItems = [...items];
        newItems.unshift({
          id: `${Date.now()}-${Math.random()}`,
          createdAt: new Date(),
          schema: payload.schema,
          table: payload.table,
          commit_timestamp: payload.commit_timestamp,
          errors: payload.errors,
          eventType: payload.eventType,
          new: JSON.stringify(payload.new),
          old: JSON.stringify(payload.old),
        });
        setItems(newItems);
      })
      .subscribe();
    // eslint-disable-next-line no-console
    console.log("[Supabase] Subscribed to channel");
  }

  return (
    <IndexPageLayout title="Supabase Playground">
      <TableSimple
        items={items}
        headers={[
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (i) => <DateCell date={i.createdAt} />,
          },
          {
            name: "schema",
            title: "schema",
            value: (i) => i.schema,
          },
          {
            name: "table",
            title: "table",
            value: (i) => i.table,
          },
          {
            name: "eventType",
            title: "eventType",
            value: (i) => i.eventType,
          },
          {
            name: "new",
            title: "new",
            value: (i) => i.new,
          },
          {
            name: "old",
            title: "old",
            value: (i) => i.old,
          },
          {
            name: "errors",
            title: "errors",
            value: (i) => i.errors.join("\n"),
          },
        ]}
      />
      {/* <ActionResultModal actionData={actionData} showSuccess={true} /> */}
    </IndexPageLayout>
  );
}
