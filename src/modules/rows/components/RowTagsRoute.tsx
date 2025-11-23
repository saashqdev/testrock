"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { LoaderData } from "../routes/Rows_Tags.server";
import RowSettingsTags from "@/components/entities/rows/RowSettingsTags";

export default function RowTagsRoute() {
  const [data, setData] = useState<LoaderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/rows/${params.id}/tags`);

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return <RowSettingsTags item={data.rowData.item} tags={data.tags} />;
}
