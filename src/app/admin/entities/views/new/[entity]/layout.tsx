import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function NewEntityViewLayout(props: IServerComponentsProps & { children: React.ReactNode }) {
  return <>{props.children}</>;
}
