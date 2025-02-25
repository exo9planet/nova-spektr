import { ComponentProps } from 'react';

import { useI18n } from '@app/providers';
import { FootnoteText, DetailRow } from '@shared/ui';
import { cnTw } from '@shared/lib/utils';
import { XcmFee } from '../XcmFee/XcmFee';

type Props = ComponentProps<typeof XcmFee> & {
  label?: string;
  wrapperClassName?: string;
};

export const XcmFeeWithLabel = ({ label, wrapperClassName, ...feeProps }: Props) => {
  const { t } = useI18n();

  return (
    <DetailRow
      label={<FootnoteText className="text-text-tertiary">{label || t('operation.xcmFee')}</FootnoteText>}
      className={cnTw('text-text-primary', wrapperClassName)}
    >
      <XcmFee {...feeProps} />
    </DetailRow>
  );
};
