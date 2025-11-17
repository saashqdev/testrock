type CreditTypeDto = {
  id: string;
  value: string;
  name: string;
  description: string;
  amount: number;
};
export const CreditTypes: CreditTypeDto[] = [
  // {
  //   id: "credit-name",
  //   name: "Credit Name",
  //   value: "credit-name",
  //   description: "Credit Description",
  //   amount: 1,
  // },
] as const;

export type CreditType = (typeof CreditTypes)[number]["value"];
