import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function EntityViewsLayout(props: IServerComponentsProps) {
  return <>{props.children}</>;
}
