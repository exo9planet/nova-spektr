import { useState } from 'react';
import { useUnit } from 'effector-react';

import { FeeWithLabel, MultisigDepositWithLabel } from '@entities/transaction';
import { Button, DetailRow, FootnoteText, Icon } from '@shared/ui';
import { useI18n } from '@app/providers';
import { SignButton } from '@entities/operations';
import { AddressWithExplorers, WalletIcon, accountUtils, ExplorersPopover, WalletCardSm } from '@entities/wallet';
import { proxyUtils } from '@entities/proxy';
import { confirmModel } from '../model/confirm-model';
import { toAddress } from '@shared/lib/utils';
import { ProxyType } from '@shared/core';

type Props = {
  onGoBack: () => void;
};

export const Confirmation = ({ onGoBack }: Props) => {
  const { t } = useI18n();

  const confirmStore = useUnit(confirmModel.$confirmStore);
  const initiatorWallet = useUnit(confirmModel.$initiatorWallet);
  const signerWallet = useUnit(confirmModel.$signerWallet);
  const proxiedWallet = useUnit(confirmModel.$proxiedWallet);

  const api = useUnit(confirmModel.$api);

  const [isFeeLoading, setIsFeeLoading] = useState(true);

  if (!confirmStore || !initiatorWallet) return null;

  return (
    <div className="flex flex-col items-center pt-4 gap-y-4 pb-4 px-5">
      <div className="flex flex-col items-center gap-y-3 mb-2">
        <Icon name="proxyConfirm" size={60} />

        <FootnoteText className="py-2 px-3 rounded bg-block-background ml-3 text-text-secondary">
          {confirmStore.description}
        </FootnoteText>
      </div>

      <dl className="flex flex-col gap-y-4 w-full">
        {proxiedWallet && confirmStore.proxiedAccount && (
          <>
            <DetailRow label={t('transfer.senderProxiedWallet')} className="flex gap-x-2">
              <WalletIcon type={proxiedWallet.type} size={16} />
              <FootnoteText className="pr-2">{proxiedWallet.name}</FootnoteText>
            </DetailRow>

            <DetailRow label={t('transfer.senderAccount')}>
              <AddressWithExplorers
                type="short"
                explorers={confirmStore.chain!.explorers}
                addressFont="text-footnote text-inherit"
                accountId={confirmStore.proxiedAccount.accountId}
                addressPrefix={confirmStore.chain!.addressPrefix}
                wrapperClassName="text-text-secondary"
              />
            </DetailRow>

            <hr className="border-filter-border w-full pr-2" />

            <DetailRow label={t('transfer.signingWallet')} className="flex gap-x-2">
              <WalletIcon type={initiatorWallet.type} size={16} />
              <FootnoteText className="pr-2">{initiatorWallet.name}</FootnoteText>
            </DetailRow>

            <DetailRow label={t('transfer.signingAccount')}>
              <AddressWithExplorers
                type="short"
                explorers={confirmStore.chain!.explorers}
                addressFont="text-footnote text-inherit"
                accountId={confirmStore.proxiedAccount.proxyAccountId}
                addressPrefix={confirmStore.chain!.addressPrefix}
                wrapperClassName="text-text-secondary"
              />
            </DetailRow>
          </>
        )}

        {!proxiedWallet && (
          <>
            <DetailRow label={t('proxy.details.wallet')} className="flex gap-x-2">
              <WalletIcon type={initiatorWallet.type} size={16} />
              <FootnoteText className="pr-2">{initiatorWallet.name}</FootnoteText>
            </DetailRow>

            <DetailRow label={t('proxy.details.account')}>
              <AddressWithExplorers
                type="short"
                explorers={confirmStore.chain!.explorers}
                addressFont="text-footnote text-inherit"
                accountId={confirmStore.account!.accountId}
                addressPrefix={confirmStore.chain!.addressPrefix}
                wrapperClassName="text-text-secondary"
              />
            </DetailRow>
          </>
        )}

        {signerWallet && confirmStore.signatory && (
          <DetailRow label={t('proxy.details.signatory')}>
            <ExplorersPopover
              button={<WalletCardSm wallet={signerWallet} />}
              address={confirmStore.signatory.accountId}
              explorers={confirmStore.chain?.explorers}
              addressPrefix={confirmStore.chain?.addressPrefix}
            />
          </DetailRow>
        )}

        <hr className="border-filter-border w-full pr-2" />

        <DetailRow label={t('proxy.details.accessType')} className="pr-2">
          <FootnoteText>{t(proxyUtils.getProxyTypeName(ProxyType.ANY))}</FootnoteText>
        </DetailRow>

        <DetailRow label={t('proxy.details.revokeFor')}>
          <AddressWithExplorers
            type="short"
            explorers={confirmStore.chain?.explorers}
            addressFont="text-footnote text-inherit"
            address={toAddress(confirmStore.spawner, { prefix: confirmStore.chain?.addressPrefix })}
            wrapperClassName="text-text-secondary"
          />
        </DetailRow>

        <hr className="border-filter-border w-full pr-2" />

        {accountUtils.isMultisigAccount(confirmStore.account!) && (
          <MultisigDepositWithLabel
            api={api}
            asset={confirmStore.chain!.assets[0]}
            threshold={confirmStore.account.threshold}
          />
        )}

        <FeeWithLabel
          api={api}
          asset={confirmStore.chain!.assets[0]}
          transaction={confirmStore.transaction}
          onFeeLoading={setIsFeeLoading}
        />
      </dl>

      <div className="flex w-full justify-between mt-3">
        <Button variant="text" onClick={onGoBack}>
          {t('operation.goBackButton')}
        </Button>

        <SignButton
          disabled={isFeeLoading}
          type={(signerWallet || initiatorWallet)?.type}
          onClick={confirmModel.output.formSubmitted}
        />
      </div>
    </div>
  );
};
