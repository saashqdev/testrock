"use client";

import SendersNewRoute from "../../components/senders/SendersNewRoute";
import { LoaderData } from "../Senders_New";

interface SendersNewViewProps {
  data: LoaderData;
}

export default function SendersNewView({ data }: SendersNewViewProps) {
  return <SendersNewRoute />;
}
