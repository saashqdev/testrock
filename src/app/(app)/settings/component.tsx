"use client";

import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import UserProfileSettings from "@/modules/users/components/UserProfileSettings";
import { UserWithoutPasswordDto } from "@/db/models/accounts/UsersModel";
import Tabs from "@/components/ui/tabs/Tabs";

type ComponentProps = {
  user: UserWithoutPasswordDto;
};

export default function Component({ user }: ComponentProps) {
  return (
    <div>
      <HeaderBlock />
      <div className="mx-auto max-w-5xl space-y-5 px-4">
        <div className="border-border border-b pb-5">
          {/* <h3 className="text-xl font-semibold leading-6 text-foreground">Settings</h3> */}
          <Tabs
            tabs={[
              { name: `Profile`, routePath: "/settings" },
              { name: `Subscription`, routePath: "/settings/subscription" },
            ]}
            exact
          />
        </div>
        <UserProfileSettings user={user} />
      </div>
      <FooterBlock />
    </div>
  );
}
