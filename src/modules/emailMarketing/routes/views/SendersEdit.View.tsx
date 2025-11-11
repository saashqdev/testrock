"use client";

import SendersEditRoute from "../../components/senders/SendersEditRoute";
import { Senders_Edit } from "../Senders_Edit";

interface SendersEditViewProps {
  data: Senders_Edit.LoaderData;
}

export default function SendersEditView({ data }: SendersEditViewProps) {
  return <SendersEditRoute data={data} />;
}
