import { TFunction } from "i18next";
import { TenantWithUsageDto } from "@/db/models/accounts/TenantsModel";
import SubscriptionUtils from "./SubscriptionUtils";

function getProducts({ t, item }: { t: TFunction; item: TenantWithUsageDto }) {
  if (item.subscription?.products) {
    return item.subscription.products.map((item) => SubscriptionUtils.getProductTitle({ t, item })).join(", ");
  }
  return "";
}

export default {
  getProducts,
};
