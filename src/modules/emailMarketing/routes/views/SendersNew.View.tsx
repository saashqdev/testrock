"use client";

import SendersNewRoute from "../../components/senders/SendersNewRoute";
import { Senders_New } from "../Senders_New";

interface SendersNewViewProps {
  data: Senders_New.LoaderData;
}

export default function SendersNewView({ data }: SendersNewViewProps) {
  return <SendersNewRoute />;
}
