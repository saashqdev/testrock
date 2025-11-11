import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  modal: ReactNode;
};

export default function EmailsLayout({ children, modal }: Props) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
