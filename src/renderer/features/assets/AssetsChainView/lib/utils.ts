import BigNumber from 'bignumber.js';

import { Decimal, totalAmount } from '@shared/lib/utils';
import { PriceObject } from '@shared/api/price-provider';
import type { Asset, Balance } from '@shared/core';

const getBalanceBn = (balance: string, precision: number) => {
  const BNWithConfig = BigNumber.clone();
  BNWithConfig.config({
    // HOOK: for divide with decimal part
    DECIMAL_PLACES: precision || Decimal.SMALL_NUMBER,
    ROUNDING_MODE: BNWithConfig.ROUND_DOWN,
    FORMAT: {
      decimalSeparator: '.',
      groupSeparator: '',
    },
  });
  const TEN = new BNWithConfig(10);
  const bnPrecision = new BNWithConfig(precision);

  return new BNWithConfig(balance).div(TEN.pow(bnPrecision));
};

export const balanceSorter = (
  first: Asset,
  second: Asset,
  balancesObject: Record<string, Balance>,
  assetPrices: PriceObject | null,
  currency?: string,
) => {
  const firstTotal = totalAmount(balancesObject[first.assetId.toString()]);
  const secondTotal = totalAmount(balancesObject[second.assetId.toString()]);

  const firstBalance = getBalanceBn(firstTotal, first.precision);
  const secondBalance = getBalanceBn(secondTotal, second.precision);

  const firstAssetPrice = first.priceId && currency && assetPrices?.[first.priceId]?.[currency]?.price;
  const secondAssetPrice = second.priceId && currency && assetPrices?.[second.priceId]?.[currency]?.price;

  const firstFiatBalance = new BigNumber(firstAssetPrice || 0).multipliedBy(firstBalance);
  const secondFiatBalance = new BigNumber(secondAssetPrice || 0).multipliedBy(secondBalance);

  if (firstFiatBalance.gt(secondFiatBalance)) return -1;
  if (firstFiatBalance.lt(secondFiatBalance)) return 1;

  if (firstBalance.gt(secondBalance)) return -1;
  if (firstBalance.lt(secondBalance)) return 1;

  return first.name.localeCompare(second.name);
};
