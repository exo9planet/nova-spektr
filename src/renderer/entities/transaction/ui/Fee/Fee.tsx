import { ApiPromise } from '@polkadot/api';
import { BN } from '@polkadot/util';
import { useEffect, useState, memo } from 'react';
import { useUnit } from 'effector-react';

import { AssetBalance } from '@entities/asset';
import { FeeLoader, Transaction, transactionService } from '@entities/transaction';
import type { Asset } from '@shared/core';
import { priceProviderModel } from '@entities/price';
import { AssetFiatBalance } from '@entities/price/ui/AssetFiatBalance';

type Props = {
  api?: ApiPromise;
  multiply?: number;
  asset: Asset;
  transaction?: Transaction;
  className?: string;
  onFeeChange?: (fee: string) => void;
  onFeeLoading?: (loading: boolean) => void;
};

export const Fee = memo(({ api, multiply = 1, asset, transaction, className, onFeeChange, onFeeLoading }: Props) => {
  const fiatFlag = useUnit(priceProviderModel.$fiatFlag);

  const [fee, setFee] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const updateFee = (fee: string) => {
    const totalFee = new BN(fee).muln(multiply).toString();

    setFee(totalFee);
    onFeeChange?.(totalFee);
  };

  useEffect(() => {
    onFeeLoading?.(isLoading);
  }, [isLoading]);

  useEffect(() => {
    setIsLoading(true);

    if (!api) return;

    if (!transaction?.address) {
      updateFee('0');
      setIsLoading(false);
    } else {
      transactionService
        .getTransactionFee(transaction, api)
        .then(updateFee)
        .catch((error) => {
          updateFee('0');
          console.info('Error getting fee - ', error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [transaction, api]);

  if (isLoading) return <FeeLoader fiatFlag={Boolean(fiatFlag)} />;

  return (
    <div className="flex flex-col gap-y-0.5 items-end">
      <AssetBalance value={fee} asset={asset} className={className} />
      <AssetFiatBalance asset={asset} amount={fee} />
    </div>
  );
});
