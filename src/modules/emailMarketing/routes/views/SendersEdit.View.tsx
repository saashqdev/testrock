"use client";

import SendersEditRoute from "../../components/senders/SendersEditRoute";
import { LoaderData } from "../Senders_Edit";

interface SendersEditViewProps {
  data: LoaderData;
}

export default function SendersEditView({ data }: SendersEditViewProps) {
  return <SendersEditRoute data={data} />;
}
