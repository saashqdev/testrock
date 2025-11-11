import currencies from "@/lib/pricing/currencies";
import { clearCacheKey } from "@/lib/services/cache.server";
import { prisma } from "@/db/config/prisma/database";

async function clearSubscriptionsCache(portalId: string) {
  const portalUserSubscriptions = await prisma.portalUserSubscription.findMany({ where: { portalId } });
  portalUserSubscriptions.forEach((item) => {
    clearCacheKey(`portalUserSubscription:${item.portalId}:${item.portalUserId}`);
  });
}

function convertToCurrency({ from, price, to }: { from: string; price: number; to: string }): number {
  const fromCurrency = currencies.find((f) => f.value === from);
  const toCurrency = currencies.find((f) => f.value === to);
  if (!fromCurrency || !toCurrency) {
    return 0;
  }
  const fromParity = fromCurrency.parities?.find((f) => f.from === to);
  const toParity = toCurrency.parities?.find((f) => f.from === from);
  if (fromParity && fromParity.parity !== 0) {
    return price / fromParity.parity;
  } else if (toParity && toParity.parity !== 0) {
    return price / toParity.parity;
  }
  return 0;
}

export default {
  clearSubscriptionsCache,
  convertToCurrency,
};
